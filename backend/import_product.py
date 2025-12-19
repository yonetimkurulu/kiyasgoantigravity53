import asyncio
import os
import requests
from bs4 import BeautifulSoup
from slugify import slugify
from dotenv import load_dotenv
from supabase import create_client, Client

# Load Env
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env'))

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

import asyncio
import os
import time
import re
from slugify import slugify
from dotenv import load_dotenv
from supabase import create_client, Client
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from bs4 import BeautifulSoup

# Load Env
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env'))

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def fetch_nanoreview_selenium(url):
    print(f"Fetching {url} via Selenium (Visible Mode)...")
    options = Options()
    # options.add_argument("--headless")  <-- DISABLED TO BYPASS CLOUDFLARE
    options.add_argument("--start-maximized")
    options.add_argument("--disable-blink-features=AutomationControlled") 
    options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
    
    driver = webdriver.Chrome(options=options)
    try:
        driver.get(url)
        print("   ⏳ Waiting 15s for Cloudflare/Loading... (Please solve Captcha if you see one!)")
        time.sleep(15) 
        
        # Debug: Save Screenshot
        driver.save_screenshot("debug_nanoreview.png")
        print("   📸 Saved debug_nanoreview.png")
        
        html = driver.page_source
        return html
    except Exception as e:
        print(f"Selenium Error: {e}")
        return None
    finally:
        driver.quit()

def parse_nanoreview(html, url):
    soup = BeautifulSoup(html, 'lxml')
    
    # Initialize Variants Combo globally for function
    variants_combo = [] 

    # 1. Product Name - Relaxed Selector
    h1 = soup.find('h1', class_='page-title')
    if not h1:
        h1 = soup.find('h1') # Try any H1
        
    title = h1.get_text(strip=True) if h1 else "Unknown Product"
    
    # 404 Check
    if "Page not found" in title or "404" in title or title == "Unknown Product":
        print(f"❌ Error: Page not found or invalid product title: '{title}'")
        return []

    clean_name = title.split('-')[0].strip().replace("Review", "").strip()
    
    print(f"Detected Product: {clean_name}")
    
    # 2. Image
    image = ""
    og_img = soup.find('meta', property='og:image')
    if og_img:
        image = og_img['content']
    
    # 3. Specs Extraction
    specs_list = []
    
    # Strategy A: Table Parsing (Details usually lower down)
    rows = soup.find_all('tr')
    for row in rows:
        cols = row.find_all('td')
        if len(cols) == 2:
            key = cols[0].get_text(strip=True)
            val = cols[1].get_text(strip=True)
            # Fuzzy match
            for target in ["Display", "Camera", "Processor", "RAM", "Storage", "Battery", "OS", "Chipset", "Weight", "Dimensions"]:
                if target.lower() in key.lower():
                     specs_list.append(f"- **{key}:** {val}")

    # Strategy B: Top Summary Box (The "Key Features" next to image)
    # Usually: <ul><li>Screen: ...</li><li>SoC: ...</li></ul>
    # We look for LI elements containing ":"
    top_specs = soup.find_all('li')
    captured_keys_summary = ["Screen", "SoC", "CPU", "Camera", "Battery", "OS", "Weight"]
    
    print(f"   🔎 Debug: Scanning {len(top_specs)} list items for specs...")
    
    for li in top_specs:
        text = li.get_text(strip=True)
        # Check format "Key: Value"
        if ":" in text:
            parts = text.split(":", 1)
            key = parts[0].strip()
            val = parts[1].strip()
            
            # Check if relevant
            for target in captured_keys_summary:
                if target.lower() in key.lower():
                    # Prioritize this over table if duplicate? Or just append.
                    # Usually these are the "Highlights"
                    specs_list.insert(0, f"- **{key}:** {val}") # Add to top
                    print(f"      -> Found Spec: {key} = {val}")

    # Deduplicate specs list
    specs_list = list(set(specs_list))
    # Sort simple logic or keep order? Set messes order. 
    # Let's simple dedupe preserving order
    seen = set()
    ordered_specs = []
    for s in specs_list:
        if s not in seen:
            ordered_specs.append(s)
            seen.add(s)
    specs_list = ordered_specs
    
    if not specs_list:
         print("   ⚠️ Debug: No specs found in Table or Lists.")

    # Strategy C: Memory Parsing (Variants)

    # Strategy B: Memory Dropdown/Label Parsing (Common in NanoReview)
    # Looking for text like "Memory: 12 / 256 GB"
    # Or CSS selector for the memory box
    
    # Try to find the specific memory selector seen in screenshots
    # Often it's in a block "Select the amount of RAM..."
    # We look for any text containing " / " and "GB" which usually indicates variant
    
    # Strategy B: Memory Dropdown/Label Parsing
    
    # Attempt 1: Local Context around "Memory:"
    memory_section = soup.find(string=re.compile("Memory:", re.IGNORECASE))
    if memory_section:
        parent = memory_section.find_parent()
        grandparent = parent.find_parent() if parent else None
        
        # Check text in grandparent to catch siblings/dropdowns
        context_text = grandparent.get_text() if grandparent else parent.get_text() if parent else ""
        
        matches = re.findall(r'(\d+)\s*(?:GB)?\s*/\s*(\d+)\s*(?:GB)?', context_text, re.IGNORECASE)
        for ram, store in matches:
             variants_combo.append((f"{ram} GB", f"{store} GB"))

    # Attempt 2: Global Search (Fallback)
    if not variants_combo:
        print("   🔎 Fallback: Trying GLOBAL page search for RAM/Storage variants...")
        all_text = soup.get_text()
        matches = re.findall(r'(\d+)\s*(?:GB)?\s*/\s*(\d+)\s*(?:GB)?', all_text, re.IGNORECASE)
        
        for ram, store in matches:
            if int(ram) < 128 and int(store) >= 32:
                 variants_combo.append((f"{ram} GB", f"{store} GB"))

    # Deduplicate
    variants_combo = list(set(variants_combo))

    # Format Description
    
    # 2. If no combo found, check standard table for separate RAM/Storage
    if not variants_combo:
         # Try to extract from table values if we found them earlier
         ram_val = specs_found.get("RAM", "")
         store_val = specs_found.get("Storage", "")
         
         if ram_val and store_val:
             # If table says "8, 12 GB" and "128, 256 GB", we can't easily map 1:1, 
             # so we might generate cross product or just pick meaningful ones.
             # For now, let's trust Strategy B mostly.
             pass

    # Format Description
    desc = f"## {clean_name} Özellikleri\n\n"
    if specs_list:
        desc += "\n".join(specs_list)
    else:
        desc += "Detaylı özellikler henüz eklenmedi."
    desc += f"\n\n*(Kaynak: NanoReview - {url})*"

    # Generate Variants (Cartesian Product)
    product_variants = []
    
    # Colors
    colors = ["Siyah", "Beyaz", "Mavi", "Titanyum"] # Generic palette
    
    if variants_combo:
         print(f"   ✨ Detected Variants: {variants_combo}")
         for ram, store in variants_combo:
            # variants_combo items already have " GB" suffix (e.g. "12 GB")
            
            # 1. Handle 1024 GB -> 1 TB
            if "1024" in ram: 
                ram_display = "1 TB"
            else:
                ram_display = ram # Keep "12 GB"
            
            if "1024" in store: 
                store_display = "1 TB"
            else:
                store_display = store # Keep "256 GB"
            
            # Clean up potential double spaces
            ram_display = ram_display.strip()
            store_display = store_display.strip()
            
            variant_name = f"{clean_name} {ram_display}/{store_display}"
            product_variants.append({
                "name": variant_name,
                "slug": slugify(variant_name),
                "image": image, 
                "desc": desc,
                "category": "Smartphone",
                "source": "NanoReview",
                "link": url,
                "price": 0
            })
    else:
        # Fallback: Just main product
        product_variants.append({
            "name": clean_name,
            "slug": slugify(clean_name),
            "image": image,
            "desc": desc,
            "category": "Smartphone",
            "source": "NanoReview",
            "link": url,
            "price": 0
        })

    return product_variants

import random
from app.services.rag_engine import rag_engine

# ... (Previous Imports kept implicitly, but need to ensure rag_engine import is added at top if not there)

# Note: The tool 'replace_file_content' replaces a block. I need adding imports at top and logic at bottom. 
# I will do this in two steps or careful big block.
# Let's verify imports first.

# UPDATE: upsert_products logic
async def upsert_products(variants):
    print(f"Upserting {len(variants)} variants (with RAG & Pricing)...")
    
    # Generate a consistent base price for this batch (Model)
    base_price = random.randint(32000, 48000) # Base flagship range
    
    for v in variants:
        print(f"   Processing: {v['name']}")
        
        # Calculate Random Price based on specs
        price = base_price
        if "256 GB" in v['name']: price += 4000
        if "512 GB" in v['name']: price += 9000
        if "1 TB" in v['name'] or "1024 GB" in v['name']: price += 15000
        if "12 GB" in v['name']: price += 2000
        if "16 GB" in v['name']: price += 5000
        
        # Add jitter
        price += random.randint(-500, 500)
        
        # Round to nice number
        price = (price // 100) * 100 + 99 
        
        # Check by slug
        existing = supabase.table('products').select("id, image").eq('slug', v['slug']).execute()
        
        payload = {
            "name": v['name'],
            "slug": v['slug'],
            # "image": v['image'], <-- Handle explicitly below
            "desc": v['desc'],
            "category": "elektronik", 
            "subcategory": "cep-telefonu", # Added Subcategory
            "source": v['source'],
            "link": v['link'],
            "price": price, 
            "updated_at": "now()"
        }
        
        try:
            if existing.data:
                pid = existing.data[0]['id']
                existing_img = existing.data[0].get('image')
                
                # IMAGE PRESERVATION LOGIC:
                # If DB has an image, and it's not empty, KEEP IT (Don't overwrite).
                # Only overwrite if DB image is None/Empty.
                if existing_img and len(existing_img) > 10:
                     print("      -> Keeping existing manual image.")
                else:
                     payload["image"] = v['image'] # Use scraped
                
                print(f"      -> Updating ID: {pid} (Price: {price} TL)")
                supabase.table('products').update(payload).eq('id', pid).execute()
            else:
                # New Insert -> Must use scraped image
                payload["image"] = v['image']
                print(f"      -> Creating NEW (Price: {price} TL)")
                supabase.table('products').insert(payload).execute()
            
            # --- RAG INTEGRATION ---
            # Now index this info so AI Chat can use it
            print("      -> 🧠 Indexing for AI Chat...")
            await rag_engine.store_content(
                product_name=v['name'],
                text=f"Product: {v['name']}\nPrice: {price} TL\n\n{v['desc']}",
                source_url=v['link'],
                metadata={
                    "source_type": "official_specs",
                    "title": f"{v['name']} Özellikleri",
                    "domain": "nanoreview.net"
                }
            )
            
        except Exception as e:
            print(f"      ❌ Error: {e}")

async def main():
    import sys
    print("\n🔗 NANO-REVIEW IMPORTER PRO (RAG + PRICING) 🔗")
    
    urls = []
    
    # Handle multiple args: python import.py url1 url2 url3
    if len(sys.argv) > 1:
        urls = sys.argv[1:]
    else:
        # Interactive Multi-Line Input
        print("Enter URLs (one per line). Press Enter twice to finish:")
        while True:
            line = input().strip()
            if not line: break
            urls.append(line)
    
    if not urls: 
        print("No URLs provided.")
        return

    print(f"🚀 Batch Processing {len(urls)} Links...")
    
    for i, url in enumerate(urls):
        print(f"\n--- [{i+1}/{len(urls)}] Processing: {url} ---")
        html = fetch_nanoreview_selenium(url)
        if html:
            variants = parse_nanoreview(html, url)
            if variants:
                await upsert_products(variants)
            else:
                print("⚠️ No variants found/parsed.")
        else:
            print("❌ Fetch failed.")

if __name__ == "__main__":
    if os.name == 'nt':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
