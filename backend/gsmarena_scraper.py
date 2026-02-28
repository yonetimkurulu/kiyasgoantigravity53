"""
GSMArena Scraper - Ürün verilerini zenginleştirmek için
Kullanım: python gsmarena_scraper.py [--product-name "iPhone 15 Pro"] [--all]
"""

import requests
from bs4 import BeautifulSoup
import re
import json
import time
import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

# Supabase setup
SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = (
    os.getenv("SUPABASE_SERVICE_KEY")
    or os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    or os.getenv("SUPABASE_KEY")
)
supabase = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL and SUPABASE_KEY else None

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Cache-Control': 'max-age=0',
}

# Session for persistent cookies
session = requests.Session()
session.headers.update(HEADERS)

COLOR_WORDS = [
    'siyah', 'beyaz', 'mavi', 'kırmızı', 'kirmizi', 'yeşil', 'yesil', 'mor', 'gri', 'altın', 'altin', 'gümüş', 'gumus', 'titanyum',
    'black', 'white', 'blue', 'red', 'green', 'purple', 'gray', 'grey', 'gold', 'silver', 'titanium'
]

EXCLUDE_KEYWORDS = [
    'tv', 'televizyon', 'monitor', 'monitör', 'kulaklık', 'kulaklik', 'ceket', 'kurutma', 'makinesi',
    'supurge', 'süpürge', 'klima', 'buzdolabı', 'buzdolabi', 'odyssey', 'blazer'
]

INCLUDE_KEYWORDS = [
    'iphone', 'samsung galaxy', 'xiaomi', 'redmi', 'poco', 'vivo', 'oppo', 'realme', 'oneplus', 'huawei',
    'honor', 'pixel', 'motorola', 'nothing phone', 'ipad', 'tablet', 'watch', 'akilli saat', 'akıllı saat'
]


def is_gsmarena_candidate(product_name: str, category: str = '', subcategory: str = '') -> bool:
    """GSMArena için uygun ürün mü? (telefon/tablet/saat odaklı)"""
    text = f"{product_name or ''} {category or ''} {subcategory or ''}".lower()

    if any(keyword in text for keyword in EXCLUDE_KEYWORDS):
        return False

    if any(keyword in text for keyword in INCLUDE_KEYWORDS):
        return True

    # category/subcategory fallback
    if any(keyword in text for keyword in ['telefon', 'cep-telefonu', 'tablet', 'akilli-saat', 'akıllı-saat']):
        return True

    return False


def get_base_model_name(product_name: str) -> str:
    """Varyantları sadeleştirip model adı üret"""
    name = (product_name or '').lower().strip()
    name = re.sub(r'\(.*?\)', ' ', name)
    name = re.sub(r'\d+\s*(gb|tb|mb)\b', ' ', name, flags=re.IGNORECASE)
    name = re.sub(r'\d+\s*(inç|inch|\")\b', ' ', name, flags=re.IGNORECASE)
    name = name.replace('apple ', 'apple ').replace('samsung ', 'samsung ')
    for color in COLOR_WORDS:
        name = name.replace(f' {color}', ' ')
    name = re.sub(r'\s+', ' ', name).strip()
    return name


def build_gsmarena_search_term(product_name: str) -> str:
    """GSMArena araması için temiz query"""
    base = get_base_model_name(product_name)
    base = base.replace(' (3. nesil)', ' se 3').replace('(3.nesil)', ' se 3')
    base = re.sub(r'\bnesil\b', ' ', base)
    base = re.sub(r'\s+', ' ', base).strip()
    return base

def search_gsmarena(product_name: str, retry=3) -> str | None:
    """Ürün adından GSMArena URL'sini bul"""
    search_term = build_gsmarena_search_term(product_name)
    search_url = f"https://www.gsmarena.com/results.php3?sQuickSearch=yes&sName={requests.utils.quote(search_term)}"
    
    for attempt in range(retry):
        try:
            print(f"[DEBUG] Searching: {search_url}")
            time.sleep(10 + attempt * 5)  # 10 seconds delay like nanoreview
            
            response = session.get(search_url, timeout=20)
            
            if response.status_code == 429:
                wait_time = 30 * (attempt + 1)
                print(f"[WARN] Rate limited! Waiting {wait_time} seconds... (attempt {attempt+1}/{retry})")
                time.sleep(wait_time)
                continue
            
            if response.status_code != 200:
                print(f"[WARN] Search failed with status {response.status_code}")
                return None
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # İlk sonucu al
            result = soup.select_one('.makers ul li a')
            if result and result.get('href'):
                return f"https://www.gsmarena.com/{result['href']}"
            
            return None
        except Exception as e:
            print(f"[ERROR] Search error: {e}")
            if attempt < retry - 1:
                time.sleep(10)
    
    return None


def scrape_gsmarena_specs(url: str) -> dict:
    """GSMArena sayfasından spec'leri çek"""
    data = {
        'gsmarena_url': url,
        'scraped_at': time.strftime('%Y-%m-%d'),
    }
    
    try:
        response = session.get(url, timeout=15)
        if response.status_code == 429:
            print("[WARN] Rate limited! Waiting 60 seconds...")
            time.sleep(60)
            response = session.get(url, timeout=15)
        
        if response.status_code != 200:
            print(f"[ERROR] Failed to fetch {url}: {response.status_code}")
            return data
        
        soup = BeautifulSoup(response.text, 'html.parser')
        text = soup.get_text()
        
        # Battery Active Use Score (e.g., "Active use score 12:58h")
        battery_match = re.search(r'Active use score\s*(\d+):(\d+)h', text)
        if battery_match:
            hours = int(battery_match.group(1))
            minutes = int(battery_match.group(2))
            data['battery_active_hours'] = round(hours + minutes/60, 2)
        
        # Endurance Rating (e.g., "Endurance rating 86h")
        endurance_match = re.search(r'Endurance rating\s*(\d+)h', text)
        if endurance_match:
            data['battery_endurance'] = int(endurance_match.group(1))
        
        # Display Brightness (e.g., "1786 nits max brightness")
        brightness_match = re.search(r'(\d+)\s*nits\s*max\s*brightness', text, re.IGNORECASE)
        if brightness_match:
            data['display_brightness_nits'] = int(brightness_match.group(1))
        
        # Loudspeaker (e.g., "-26.4 LUFS")
        lufs_match = re.search(r'(-?\d+\.?\d*)\s*LUFS', text)
        if lufs_match:
            data['loudspeaker_lufs'] = float(lufs_match.group(1))
        
        # AnTuTu Score - spec tablosundan
        antutu_match = re.search(r'AnTuTu[:\s]+(\d[\d,]+)', text)
        if antutu_match:
            data['antutu_score'] = int(antutu_match.group(1).replace(',', ''))
        
        # Ürün adı
        title = soup.select_one('h1.specs-phone-name-title')
        if title:
            data['gsmarena_name'] = title.get_text(strip=True)
        
        print(f"[OK] Scraped: {data.get('gsmarena_name', url)}")
        print(f"     Battery: {data.get('battery_active_hours', 'N/A')}h active, {data.get('battery_endurance', 'N/A')}h endurance")
        print(f"     Display: {data.get('display_brightness_nits', 'N/A')} nits")
        
        return data
        
    except Exception as e:
        print(f"[ERROR] Scrape error: {e}")
        return data


def enrich_product(product_name: str, product_id: int = None) -> dict:
    """Ürün verilerini GSMArena ile zenginleştir"""
    print(f"\n[INFO] Processing: {product_name}")
    
    # URL bul
    url = search_gsmarena(product_name)
    if not url:
        print(f"[WARN] No GSMArena URL found for: {product_name}")
        return {}
    
    print(f"[INFO] Found URL: {url}")
    time.sleep(10)  # 10 seconds like nanoreview
    
    # Spec'leri çek
    specs = scrape_gsmarena_specs(url)
    
    # Veritabanına kaydet (eğer product_id varsa)
    if product_id and supabase and specs:
        try:
            result = supabase.table('products').update({
                'gsmarena_data': specs
            }).eq('id', product_id).execute()
            print(f"[OK] Saved to database for product ID: {product_id}")
        except Exception as e:
            print(f"[ERROR] Database save failed: {e}")
    
    return specs


def enrich_all_products(limit: int = 50, delay_seconds: int = 15):
    """Veritabanındaki tüm ürünleri zenginleştir"""
    if not supabase:
        print("[ERROR] Supabase not configured!")
        return
    
    # gsmarena_data olmayan ürünleri al
    result = supabase.table('products').select('id, slug, name, category, subcategory, product_family_key').is_('gsmarena_data', 'null').limit(max(limit * 5, 100)).execute()
    
    if not result.data:
        print("[INFO] No products to enrich!")
        return
    
    print(f"[INFO] Found {len(result.data)} raw products to inspect")

    candidates = [
        item for item in result.data
        if is_gsmarena_candidate(item.get('name', ''), item.get('category', ''), item.get('subcategory', ''))
    ]

    grouped = {}
    for item in candidates:
        family_key = item.get('product_family_key') or get_base_model_name(item.get('name', ''))
        grouped.setdefault(family_key, []).append(item)

    groups = list(grouped.values())[:limit]
    print(f"[INFO] Candidate groups: {len(groups)} (from {len(candidates)} compatible products)")

    success = 0
    no_match = 0
    for group in groups:
        representative = group[0]
        model_name = representative.get('name')
        print(f"\n[INFO] Processing group model: {model_name} ({len(group)} variants)")

        specs = enrich_product(model_name)
        if not specs or not specs.get('gsmarena_url'):
            no_match += 1
            continue

        ids = [item.get('id') for item in group if item.get('id')]
        if ids:
            try:
                supabase.table('products').update({'gsmarena_data': specs}).in_('id', ids).execute()
                print(f"[OK] Saved GSMArena data to {len(ids)} variants")
                success += 1
            except Exception as e:
                print(f"[ERROR] Bulk save failed: {e}")

        time.sleep(max(1, delay_seconds))

    print(f"\n[DONE] GSMArena enrichment finished. Success groups: {success}, No match groups: {no_match}")


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='GSMArena Scraper')
    parser.add_argument('--product-name', type=str, help='Tek ürün adı')
    parser.add_argument('--all', action='store_true', help='Tüm ürünleri zenginleştir')
    parser.add_argument('--limit', type=int, default=50, help='Maksimum ürün sayısı')
    parser.add_argument('--delay', type=int, default=15, help='Ürünler arası bekleme (saniye)')
    parser.add_argument('--test', action='store_true', help='Test modu (iPhone 15 Pro)')
    
    args = parser.parse_args()
    
    if args.test:
        result = enrich_product("Apple iPhone 15 Pro")
        print("\n[RESULT]")
        print(json.dumps(result, indent=2, ensure_ascii=False))
    elif args.product_name:
        result = enrich_product(args.product_name)
        print("\n[RESULT]")
        print(json.dumps(result, indent=2, ensure_ascii=False))
    elif args.all:
        enrich_all_products(limit=max(1, args.limit), delay_seconds=max(1, args.delay))
    else:
        print("Kullanım: python gsmarena_scraper.py --test")
        print("         python gsmarena_scraper.py --product-name 'iPhone 15 Pro'")
        print("         python gsmarena_scraper.py --all --limit 30 --delay 15")
