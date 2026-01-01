"""
GSMArena Scraper - Selenium Version
Gerçek tarayıcı kullanarak rate limiting'i bypass eder
Kullanım: python gsmarena_selenium.py --test
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
from selenium.webdriver.chrome.service import Service
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
    """Chrome driver oluştur"""
    options = Options()
    options.add_argument("--headless")  # Headless mode
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1920,1080")
    options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
    
    driver = webdriver.Chrome(options=options)
    return driver


def get_base_model_name(product_name: str) -> str:
    """Ürün adından base model adını çıkar (storage ve renk olmadan)"""
    name = product_name.lower()
    name = name.replace('apple ', '').replace('samsung ', '').replace('xiaomi ', '')
    # Storage boyutlarını çıkar
    name = re.sub(r'\d+\s*(gb|tb)\b', '', name, flags=re.IGNORECASE)
    # Renkleri çıkar (Türkçe + İngilizce)
    colors = [
        # Türkçe renkler
        'siyah', 'beyaz', 'mavi', 'kırmızı', 'yeşil', 'mor', 'gri', 'altın', 'gümüş', 'titanyum',
        'sarı', 'pembe', 'turuncu', 'lacivert', 'bej', 'krem', 'bordo', 'kahverengi', 'turkuaz',
        'natürel', 'kozmik', 'okyanus', 'gece', 'gündüz', 'çöl', 'orman', 'kar', 'buz',
        # İngilizce renkler
        'black', 'white', 'blue', 'red', 'green', 'purple', 'gray', 'grey', 'gold', 'silver', 'titanium', 'pink',
        'yellow', 'orange', 'brown', 'beige', 'cream', 'navy', 'turquoise', 'coral', 'midnight',
        'starlight', 'graphite', 'sierra', 'alpine', 'space', 'phantom', 'cosmic', 'desert', 'natural'
    ]
    for color in colors:
        name = name.replace(f' {color}', '')
    # Ekstra temizlik
    name = re.sub(r'\s+', ' ', name)  # Çoklu boşlukları tek boşluğa çevir
    return name.strip()


def search_gsmarena(driver, product_name: str) -> str | None:
    """Ürün adından GSMArena URL'sini bul - en iyi eşleşmeyi seç"""
    # get_base_model_name kullanarak normalize et (renkler ve storage dahil)
    search_term = get_base_model_name(product_name)
    search_url = f"https://www.gsmarena.com/results.php3?sQuickSearch=yes&sName={search_term.replace(' ', '+')}"
    
    try:
        print(f"[DEBUG] Navigating to: {search_url}")
        driver.get(search_url)
        time.sleep(3)
        
        # Tüm sonuçları al
        results = driver.find_elements(By.CSS_SELECTOR, ".makers ul li a")
        if not results:
            print(f"[WARN] No results found for: {product_name}")
            return None
        
        # En iyi eşleşmeyi bul
        search_lower = product_name.lower()
        # Normalize edilmiş arama terimi (get_base_model_name ile aynı)
        search_normalized = get_base_model_name(product_name)
        best_match = None
        best_score = -100
        
        for result in results[:10]:
            title = result.find_element(By.TAG_NAME, "span").text.lower()
            href = result.get_attribute("href")
            
            # Temel skor - ortak kelimeler
            score = 0
            search_words = search_normalized.split()
            for word in search_words:
                if word in title:
                    score += 2
            
            # BONUS: Model varyantı tam eşleşme
            has_pro = "pro" in search_normalized
            has_pro_max = "pro max" in search_normalized
            has_ultra = "ultra" in search_normalized
            has_plus = "plus" in search_normalized
            
            title_has_pro = "pro" in title
            title_has_pro_max = "pro max" in title
            title_has_ultra = "ultra" in title
            title_has_plus = "plus" in title
            
            # Tam eşleşme bonusu
            if has_pro_max and title_has_pro_max:
                score += 10
            elif has_pro and not has_pro_max and title_has_pro and not title_has_pro_max:
                score += 10
            elif has_ultra and title_has_ultra:
                score += 10
            elif has_plus and title_has_plus:
                score += 10
            elif not has_pro and not has_pro_max and not has_ultra and not has_plus:
                # Arama teriminde hiçbir varyant yok - düz model
                if not title_has_pro and not title_has_pro_max and not title_has_ultra and not title_has_plus:
                    score += 10  # Düz model tercihi
            
            # PENALTY: Arama teriminde olmayan varyantlar için ceza
            if not has_pro_max and title_has_pro_max:
                score -= 15
            if not has_pro and title_has_pro and not title_has_pro_max:
                score -= 8
            if not has_ultra and title_has_ultra:
                score -= 15
            if not has_plus and title_has_plus:
                score -= 8
            
            if score > best_score:
                best_score = score
                best_match = href
                print(f"[DEBUG] Match: {title} (score: {score})")
        
        if best_match:
            print(f"[OK] Best match: {best_match}")
            return best_match
        
        # Fallback: İlk sonucu al
        href = results[0].get_attribute("href")
        print(f"[OK] Fallback to first result: {href}")
        return href
        
    except NoSuchElementException:
        print(f"[WARN] No results found for: {product_name}")
        return None
    except Exception as e:
        print(f"[ERROR] Search error: {e}")
        return None


def scrape_gsmarena_specs(driver, url: str) -> dict:
    """GSMArena sayfasından spec'leri çek"""
    data = {
        'gsmarena_url': url,
        'scraped_at': time.strftime('%Y-%m-%d'),
    }
    
    try:
        print(f"[DEBUG] Navigating to spec page: {url}")
        driver.get(url)
        time.sleep(3)
        
        # Get page text
        text = driver.find_element(By.TAG_NAME, "body").text
        
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
        
        # AnTuTu Score (spec tablosundan veya test bölümünden)
        antutu_match = re.search(r'AnTuTu[:\s]+v?\d*[:\s]*(\d[\d,\.]+)', text, re.IGNORECASE)
        if antutu_match:
            score_str = antutu_match.group(1).replace(',', '').replace('.', '')
            if len(score_str) >= 5:  # En az 100k olmalı
                data['antutu_score'] = int(score_str)
        
        # Ürün adı
        try:
            title = driver.find_element(By.CSS_SELECTOR, "h1.specs-phone-name-title")
            data['gsmarena_name'] = title.text.strip()
        except:
            pass
        
        print(f"[OK] Scraped: {data.get('gsmarena_name', url)}")
        print(f"     Battery: {data.get('battery_active_hours', 'N/A')}h active, {data.get('battery_endurance', 'N/A')}h endurance")
        print(f"     Display: {data.get('display_brightness_nits', 'N/A')} nits")
        print(f"     AnTuTu: {data.get('antutu_score', 'N/A')}")
        
        return data
        
    except Exception as e:
        print(f"[ERROR] Scrape error: {e}")
        return data


def enrich_product(driver, product_name: str, product_id: int = None) -> dict:
    """Ürün verilerini GSMArena ile zenginleştir"""
    print(f"\n[INFO] Processing: {product_name}")
    
    # URL bul
    url = search_gsmarena(driver, product_name)
    if not url:
        print(f"[WARN] No GSMArena URL found for: {product_name}")
        return {}
    
    time.sleep(5)  # Wait between requests
    
    # Spec'leri çek
    specs = scrape_gsmarena_specs(driver, url)
    
    # Veritabanına kaydet
    if product_id and supabase and specs:
        try:
            result = supabase.table('products').update({
                'gsmarena_data': specs
            }).eq('id', product_id).execute()
            print(f"[OK] Saved to database for product ID: {product_id}")
        except Exception as e:
            print(f"[ERROR] Database save failed: {e}")
    
    return specs




def enrich_all_phones(limit: int = 200):
    """Sadece telefonları zenginleştir - unique model bazlı"""
    if not supabase:
        print("[ERROR] Supabase not configured!")
        return
    
    # Sadece CEP TELEFONLARINI al (subcategory filter)
    result = supabase.table('products').select('id, name, subcategory').is_('gsmarena_data', 'null').limit(1000).execute()
    
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
            
            # Bir kez scrape et
            url = search_gsmarena(driver, variants[0]['name'])
            if not url:
                print(f"[WARN] No GSMArena URL found for: {base_name}")
                continue
            
            time.sleep(5)
            specs = scrape_gsmarena_specs(driver, url)
            
            if specs:
                # Tüm varyantlara uygula
                variant_ids = [v['id'] for v in variants]
                try:
                    for vid in variant_ids:
                        supabase.table('products').update({
                            'gsmarena_data': specs
                        }).eq('id', vid).execute()
                    print(f"[OK] Saved to {len(variant_ids)} variants: {variant_ids}")
                    scraped_count += 1
                except Exception as e:
                    print(f"[ERROR] Database save failed: {e}")
            
            time.sleep(10)  # 10 seconds between models
    finally:
        driver.quit()
        print(f"\n[DONE] Scraped {scraped_count} unique models")


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='GSMArena Selenium Scraper')
    parser.add_argument('--product-name', type=str, help='Tek ürün adı')
    parser.add_argument('--all', action='store_true', help='Tüm ürünleri zenginleştir')
    parser.add_argument('--test', action='store_true', help='Test modu (iPhone 15 Pro)')
    parser.add_argument('--limit', type=int, default=50, help='Maximum ürün sayısı')
    
    args = parser.parse_args()
    
    if args.test:
        driver = create_driver()
        try:
            result = enrich_product(driver, "Apple iPhone 15 Pro")
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
        print("Kullanım: python gsmarena_selenium.py --test")
        print("         python gsmarena_selenium.py --product-name 'iPhone 15 Pro'")
        print("         python gsmarena_selenium.py --all --limit 100")
