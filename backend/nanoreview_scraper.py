"""
NanoReview Scraper - Selenium Version
Benchmark skorları, display ve kamera verilerini çeker
Kullanım: python nanoreview_scraper.py --test
"""

import re
import json
import time
import os
from dotenv import load_dotenv
from supabase import create_client

# Selenium imports
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException

load_dotenv()

# Supabase setup
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_SERVICE_KEY")
supabase = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        print(f"[OK] Supabase connected: {SUPABASE_URL[:40]}...")
    except Exception as e:
        print(f"[WARN] Supabase connection failed: {e}")
else:
    print(f"[WARN] Supabase not configured. URL: {bool(SUPABASE_URL)}, KEY: {bool(SUPABASE_KEY)}")


def create_driver():
    """Chrome driver oluştur - VISIBLE MODE (Cloudflare bypass)"""
    options = Options()
    # options.add_argument("--headless")  # DISABLED - Cloudflare bypass için görünür mod
    options.add_argument("--start-maximized")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
    
    driver = webdriver.Chrome(options=options)
    return driver


def normalize_product_name(product_name: str) -> str:
    """Ürün adını NanoReview URL formatına çevir"""
    name = product_name.lower()
    # Markaları koru ama küçük harf yap
    # NanoReview URL formatı: samsung-galaxy-s24-ultra (marka dahil)
    name = name.replace('apple ', 'apple-')
    # Samsung zaten "Galaxy" ile başlıyor genelde, marka eklemeye gerek yok
    # Storage ve renkleri çıkar
    name = re.sub(r'\d+\s*(gb|tb)\b', '', name, flags=re.IGNORECASE)
    colors = ['siyah', 'beyaz', 'mavi', 'kırmızı', 'yeşil', 'mor', 'gri', 'altın', 'gümüş', 'titanyum',
              'sarı', 'pembe', 'turuncu', 'natürel', 'kozmik',
              'black', 'white', 'blue', 'red', 'green', 'purple', 'gray', 'gold', 'silver', 'titanium', 'pink']
    for color in colors:
        name = name.replace(f' {color}', '')
    # Boşlukları tire yap
    name = re.sub(r'\s+', '-', name.strip())
    name = re.sub(r'-+', '-', name)  # Çoklu tireleri tek tire yap
    return name.strip('-')


def scrape_nanoreview(driver, product_name: str) -> dict:
    """NanoReview sayfasından verileri çek"""
    normalized = normalize_product_name(product_name)
    url = f"https://nanoreview.net/en/phone/{normalized}"
    
    data = {
        'nanoreview_url': url,
        'scraped_at': time.strftime('%Y-%m-%d'),
    }
    
    try:
        print(f"[DEBUG] Navigating to: {url}")
        driver.get(url)
        
        # Cloudflare bypass - bekle ve düzenli kontrol et
        max_wait = 60  # Maximum 60 saniye bekle
        waited = 0
        while waited < max_wait:
            time.sleep(15)  # 15 saniye aralıklarla kontrol
            waited += 15
            
            page_source = driver.page_source.lower()
            text = driver.find_element(By.TAG_NAME, "body").text
            
            # Cloudflare challenge kontrol
            if "checking your browser" in page_source or "cloudflare" in page_source:
                print(f"[DEBUG] Cloudflare challenge... waiting ({waited}s)")
                continue
            
            # Gerçek sayfa yüklendi mi?
            if len(text) > 1000 and ("nanoreview" in text.lower() or "galaxy" in text.lower() or "iphone" in text.lower()):
                print(f"[DEBUG] Page loaded after {waited}s, text length: {len(text)}")
                break
        else:
            print(f"[WARN] Cloudflare bypass failed after {max_wait}s")
            return {}
        
        # Sayfa mevcut mu kontrol et
        if "404" in driver.title or "page not found" in page_source:
            print(f"[WARN] Page not found: {url}")
            return {}
        
        # NanoReview Score (overall) - genellikle sayfanın üstünde
        score_match = re.search(r'NanoReview Score\s*(\d+)', text)
        if score_match:
            data['nanoreview_score'] = int(score_match.group(1))
        
        # AnTuTu Score
        antutu_match = re.search(r'AnTuTu(?:\s+v?\d+)?\s*[:\s]+(\d[\d,\.]+)', text, re.IGNORECASE)
        if antutu_match:
            score_str = antutu_match.group(1).replace(',', '').replace('.', '')
            if len(score_str) >= 5:
                data['antutu_score'] = int(score_str)
        
        # GeekBench Scores
        # Single-core
        gb_single = re.search(r'(?:Single[- ]?[Cc]ore|Geekbench.*Single)\s*[:\s]+(\d[\d,]+)', text)
        if gb_single:
            data['geekbench_single'] = int(gb_single.group(1).replace(',', ''))
        
        # Multi-core
        gb_multi = re.search(r'(?:Multi[- ]?[Cc]ore|Geekbench.*Multi)\s*[:\s]+(\d[\d,]+)', text)
        if gb_multi:
            data['geekbench_multi'] = int(gb_multi.group(1).replace(',', ''))
        
        # DxOMark Camera Score
        dxo_match = re.search(r'DxOMark\s*[:\s]+(\d+)', text, re.IGNORECASE)
        if dxo_match:
            data['dxomark_score'] = int(dxo_match.group(1))
        
        # Display Score
        display_score = re.search(r'Display(?:\s+Quality)?\s*[:\s]+(\d+)', text)
        if display_score:
            data['display_score'] = int(display_score.group(1))
        
        # Refresh Rate
        refresh = re.search(r'(\d+)\s*(?:-\s*)?(\d+)?\s*Hz', text)
        if refresh:
            if refresh.group(2):
                data['display_refresh_rate'] = f"{refresh.group(1)}-{refresh.group(2)} Hz"
            else:
                data['display_refresh_rate'] = f"{refresh.group(1)} Hz"
        
        # Battery Score
        battery_score = re.search(r'Battery(?:\s+Life)?\s*[:\s]+(\d+)', text)
        if battery_score:
            data['battery_score'] = int(battery_score.group(1))
        
        # Battery Capacity
        battery_cap = re.search(r'(\d[\d,]+)\s*mAh', text)
        if battery_cap:
            data['battery_capacity'] = int(battery_cap.group(1).replace(',', ''))
        
        # Gaming Score
        gaming_score = re.search(r'Gaming(?:\s+Performance)?\s*[:\s]+(\d+)', text)
        if gaming_score:
            data['gaming_score'] = int(gaming_score.group(1))
        
        # Brightness
        brightness = re.search(r'(\d[\d,]+)\s*nits\s*\((?:tested|max)', text, re.IGNORECASE)
        if brightness:
            data['brightness_nits'] = int(brightness.group(1).replace(',', ''))
        
        # Ürün adı
        try:
            title = driver.find_element(By.CSS_SELECTOR, "h1")
            data['nanoreview_name'] = title.text.strip()
        except:
            pass
        
        print(f"[OK] Scraped: {data.get('nanoreview_name', normalized)}")
        print(f"     Score: {data.get('nanoreview_score', 'N/A')}/100")
        print(f"     AnTuTu: {data.get('antutu_score', 'N/A')}")
        print(f"     GeekBench: {data.get('geekbench_single', 'N/A')}/{data.get('geekbench_multi', 'N/A')}")
        print(f"     DxOMark: {data.get('dxomark_score', 'N/A')}")
        
        return data
        
    except Exception as e:
        print(f"[ERROR] Scrape error: {e}")
        return data


def enrich_product(driver, product_name: str, product_id: int = None) -> dict:
    """Ürün verilerini NanoReview ile zenginleştir"""
    print(f"\n[INFO] Processing: {product_name}")
    
    specs = scrape_nanoreview(driver, product_name)
    
    # Veritabanına kaydet
    if product_id and supabase and specs and specs.get('nanoreview_score'):
        try:
            result = supabase.table('products').update({
                'nanoreview_data': specs
            }).eq('id', product_id).execute()
            print(f"[OK] Saved to database for product ID: {product_id}")
        except Exception as e:
            print(f"[ERROR] Database save failed: {e}")
    
    return specs


def get_base_model_name(product_name: str) -> str:
    """Ürün adından base model adını çıkar (storage ve renk olmadan)"""
    name = product_name.lower()
    name = name.replace('apple ', '').replace('samsung ', '').replace('xiaomi ', '')
    name = re.sub(r'\d+\s*(gb|tb)\b', '', name, flags=re.IGNORECASE)
    colors = ['siyah', 'beyaz', 'mavi', 'kırmızı', 'yeşil', 'mor', 'gri', 'altın', 'gümüş', 'titanyum',
              'sarı', 'pembe', 'turuncu', 'lacivert', 'natürel', 'kozmik',
              'black', 'white', 'blue', 'red', 'green', 'purple', 'gray', 'gold', 'silver', 'titanium', 'pink']
    for color in colors:
        name = name.replace(f' {color}', '')
    name = re.sub(r'\s+', ' ', name)
    return name.strip()


def enrich_all_phones(limit: int = 100):
    """Sadece telefonları zenginleştir - unique model bazlı"""
    if not supabase:
        print("[ERROR] Supabase not configured!")
        return
    
    # nanoreview_data olmayan telefonları al
    result = supabase.table('products').select('id, name, subcategory').is_('nanoreview_data', 'null').limit(1000).execute()
    
    if not result.data:
        print("[INFO] No products to enrich!")
        return
    
    # Sadece telefonları filtrele
    phone_keywords = ['iphone', 'galaxy', 'pixel', 'xiaomi', 'redmi', 'poco', 'oppo', 'realme', 'oneplus', 'huawei', 'honor', 'nothing']
    phones = [p for p in result.data if any(kw in p['name'].lower() for kw in phone_keywords)]
    
    if not phones:
        print("[INFO] No phones found!")
        return
    
    print(f"[INFO] Found {len(phones)} phone variants")
    
    # Unique modellere göre grupla
    model_groups = {}
    for phone in phones:
        base_name = get_base_model_name(phone['name'])
        if base_name not in model_groups:
            model_groups[base_name] = []
        model_groups[base_name].append(phone)
    
    print(f"[INFO] {len(model_groups)} unique models to scrape")
    
    driver = create_driver()
    scraped_count = 0
    try:
        for base_name, variants in list(model_groups.items())[:limit]:
            print(f"\n--- Model: {base_name} ({len(variants)} variants) ---")
            
            specs = scrape_nanoreview(driver, variants[0]['name'])
            
            if specs and specs.get('nanoreview_score'):
                # Tüm varyantlara uygula
                variant_ids = [v['id'] for v in variants]
                try:
                    for vid in variant_ids:
                        supabase.table('products').update({
                            'nanoreview_data': specs
                        }).eq('id', vid).execute()
                    print(f"[OK] Saved to {len(variant_ids)} variants: {variant_ids}")
                    scraped_count += 1
                except Exception as e:
                    print(f"[ERROR] Database save failed: {e}")
            
            time.sleep(15)  # 15 saniye bekleme - ban yememek için
    finally:
        driver.quit()
        print(f"\n[DONE] Scraped {scraped_count} unique models")


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='NanoReview Selenium Scraper')
    parser.add_argument('--product-name', type=str, help='Tek ürün adı')
    parser.add_argument('--all', action='store_true', help='Tüm telefonları zenginleştir')
    parser.add_argument('--test', action='store_true', help='Test modu (Galaxy S24 Ultra)')
    parser.add_argument('--limit', type=int, default=100, help='Maximum ürün sayısı')
    
    args = parser.parse_args()
    
    if args.test:
        driver = create_driver()
        try:
            result = scrape_nanoreview(driver, "Samsung Galaxy S24 Ultra")
            print("\n[RESULT]")
            print(json.dumps(result, indent=2, ensure_ascii=False))
        finally:
            driver.quit()
    elif args.product_name:
        driver = create_driver()
        try:
            result = enrich_product(driver, args.product_name)
            print("\n[RESULT]")
            print(json.dumps(result, indent=2, ensure_ascii=False))
        finally:
            driver.quit()
    elif args.all:
        enrich_all_phones(args.limit)
    else:
        print("Kullanım: python nanoreview_scraper.py --test")
        print("         python nanoreview_scraper.py --product-name 'Galaxy S24 Ultra'")
        print("         python nanoreview_scraper.py --all --limit 50")
