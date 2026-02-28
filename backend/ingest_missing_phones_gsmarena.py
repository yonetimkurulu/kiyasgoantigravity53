import argparse
import os
import re
import time
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from supabase import create_client


load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = (
    os.getenv("SUPABASE_SERVICE_KEY")
    or os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    or os.getenv("SUPABASE_KEY")
)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL and SUPABASE_KEY else None

BASE_URL = "https://www.gsmarena.com/"
MAKERS_URL = "https://www.gsmarena.com/makers.php3"

TARGET_BRANDS = {
    "apple",
    "samsung",
    "xiaomi",
    "google",
    "huawei",
    "honor",
    "oppo",
    "vivo",
    "oneplus",
    "realme",
    "nothing",
    "motorola",
}

PHONE_INCLUDE_KEYWORDS = {
    "iphone",
    "galaxy",
    "pixel",
    "xiaomi",
    "redmi",
    "poco",
    "oneplus",
    "realme",
    "oppo",
    "vivo",
    "huawei",
    "honor",
    "motorola",
    "moto",
    "nothing",
    "razr",
    "nova",
    "mate",
    "magic",
    "edge",
}

PHONE_EXCLUDE_KEYWORDS = {
    "watch",
    "pad",
    "tablet",
    "tab",
    "band",
    "buds",
    "earbuds",
    "smartwatch",
}

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
}


def slugify(value: str) -> str:
    text = (value or "").strip().lower()
    text = (
        text.replace("ı", "i")
        .replace("ğ", "g")
        .replace("ü", "u")
        .replace("ş", "s")
        .replace("ö", "o")
        .replace("ç", "c")
    )
    text = re.sub(r"[^a-z0-9\s-]", " ", text)
    text = re.sub(r"\s+", "-", text)
    text = re.sub(r"-+", "-", text)
    return text.strip("-")


def fetch_soup(url: str) -> BeautifulSoup:
    response = requests.get(url, headers=HEADERS, timeout=25)
    response.raise_for_status()
    return BeautifulSoup(response.text, "html.parser")


def get_existing_slugs() -> set[str]:
    all_slugs = set()
    page_size = 1000
    offset = 0

    while True:
        result = (
            supabase.table("products")
            .select("slug")
            .range(offset, offset + page_size - 1)
            .execute()
        )

        rows = result.data or []
        if not rows:
            break

        all_slugs.update(str(row.get("slug") or "").strip() for row in rows if row.get("slug"))
        if len(rows) < page_size:
            break
        offset += page_size

    return all_slugs


def get_brand_pages() -> list[str]:
    soup = fetch_soup(MAKERS_URL)
    links = []

    for anchor in soup.select(".st-text td a"):
        href = anchor.get("href")
        if not href:
            continue
        lower = href.lower()
        if not lower.endswith(".php"):
            continue
        if not any(brand in lower for brand in TARGET_BRANDS):
            continue
        links.append(urljoin(BASE_URL, href))

    return list(dict.fromkeys(links))


def parse_devices_from_brand_page(brand_url: str, per_brand_limit: int) -> list[dict]:
    soup = fetch_soup(brand_url)
    devices = []

    for item in soup.select(".makers ul li"):
        anchor = item.select_one("a")
        if not anchor:
            continue

        href = anchor.get("href")
        name_el = item.select_one("span")
        img_el = item.select_one("img")
        if not href or not name_el:
            continue

        name = name_el.get_text(" ", strip=True)
        if not name:
            continue

        name_lower = name.lower()
        if any(ex in name_lower for ex in PHONE_EXCLUDE_KEYWORDS):
            continue
        if not any(inc in name_lower for inc in PHONE_INCLUDE_KEYWORDS):
            continue

        devices.append(
            {
                "name": name,
                "slug": slugify(name),
                "link": urljoin(BASE_URL, href),
                "image": img_el.get("src") if img_el else None,
            }
        )

        if len(devices) >= per_brand_limit:
            break

    return devices


def insert_product(device: dict) -> bool:
    payload = {
        "name": device["name"],
        "slug": device["slug"],
        "category": "elektronik",
        "subcategory": "cep-telefonu",
        "source": "GSMArena Catalog",
        "link": device.get("link"),
        "image": device.get("image"),
        "desc": "GSMArena katalogundan eklendi. Fiyat ve detaylar enrichment ile güncellenecek.",
    }

    result = supabase.table("products").insert(payload).execute()
    if getattr(result, "data", None):
        return True

    return False


def main():
    parser = argparse.ArgumentParser(description="Ingest missing phones from GSMArena catalog")
    parser.add_argument("--per-brand", type=int, default=25, help="Max products to read per brand page")
    parser.add_argument("--max-inserts", type=int, default=200, help="Max new inserts for this run")
    parser.add_argument("--delay", type=float, default=1.0, help="Delay between brand page requests")
    args = parser.parse_args()

    if not supabase:
        raise RuntimeError("Supabase not configured. Check SUPABASE_URL and service key env vars.")

    existing_slugs = get_existing_slugs()
    print(f"[INFO] Existing slugs loaded: {len(existing_slugs)}")

    brand_pages = get_brand_pages()
    print(f"[INFO] Brand pages selected: {len(brand_pages)}")

    inserted = 0
    scanned = 0

    for brand_url in brand_pages:
        try:
            devices = parse_devices_from_brand_page(brand_url, per_brand_limit=max(1, args.per_brand))
            scanned += len(devices)

            for device in devices:
                if inserted >= max(1, args.max_inserts):
                    print(f"[DONE] Insert limit reached: {inserted}")
                    print(f"[SUMMARY] scanned={scanned}, inserted={inserted}")
                    return

                slug = device.get("slug")
                if not slug or slug in existing_slugs:
                    continue

                try:
                    ok = insert_product(device)
                    if ok:
                        existing_slugs.add(slug)
                        inserted += 1
                        print(f"[INSERT] {device['name']}")
                except Exception as insert_err:
                    print(f"[WARN] Insert failed for {device.get('name')}: {insert_err}")

            time.sleep(max(0.2, args.delay))
        except Exception as brand_err:
            print(f"[WARN] Brand page failed: {brand_url} -> {brand_err}")

    print(f"[SUMMARY] scanned={scanned}, inserted={inserted}")


if __name__ == "__main__":
    main()
