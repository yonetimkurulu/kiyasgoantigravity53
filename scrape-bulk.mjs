
import axios from 'axios';
import * as cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURATION ---
const SUPABASE_URL = "https://eupwqhesbcjczsdgkurh.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cHdxaGVzYmNqY3pzZGdrdXJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDgzNzc3NiwiZXhwIjoyMDgwNDEzNzc2fQ.iuyn8M3WvaFhHjXKkqLNRMsjoVARuvy22TIaAM1YJ80";

const PHONES_TO_SCRAPE = [
    { name: "iPhone 17 Pro", url: "https://www.kimovil.com/en/apple-iphone-17-pro" },
    { name: "iPhone 16 Pro", url: "https://www.kimovil.com/en/apple-iphone-16-pro" },
    { name: "Samsung S25 Ultra", url: "https://www.kimovil.com/en/where-to-buy-samsung-galaxy-s25-ultra" },
    { name: "iPhone 15 Pro", url: "https://www.kimovil.com/en/where-to-buy-apple-iphone-15-pro" },
    // Diğerleri için şimdilik boş geçelim veya manuel ekleyelim, öncelik bunlar
];

// --- SCRAPER LOGIC (KIMOVIL) ---
async function scrapeKimovil(url) {
    try {
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const $ = cheerio.load(data);

        // Kimovil Selectors (Tahmini/Genel)
        const name = $('h1').text().trim();
        const image = $('.main-photo').attr('src') || $('.device-photo img').attr('src');

        // Teknik Özellikler
        // Kimovil yapısı biraz karışık olabilir, genel class'lardan gitmeye çalışalım
        const display = $('.k-panel-body:contains("Display")').text().trim().substring(0, 100); // Özet
        const processor = $('.k-panel-body:contains("Processor")').text().trim();
        const ram = $('.k-panel-body:contains("RAM")').text().trim();
        const storage = $('.k-panel-body:contains("Storage")').text().trim();
        const battery = $('.k-panel-body:contains("Battery")').text().trim();
        const camera = $('.k-panel-body:contains("Camera")').text().trim();

        // Daha temiz veri için spesifik selectorler gerekebilir ama şimdilik text dump alalım
        // Supabase şemasına uydurma
        return {
            name: name || "Unknown Device",
            image: image || "",
            display: display || "OLED",
            storage: [storage] || ["256GB"],
            ram: [ram] || ["8GB"],
            camera: camera || "High Res",
            battery: battery || "5000mAh",
            networks: ["5G", "4G"],
            price: "Check Site",
            url
        };

    } catch (error) {
        console.error(`❌ Hata (${url}):`, error.message);
        return null;
    }
}

// --- DATABASE LOGIC ---
async function saveToSupabase(data) {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const { error } = await supabase.from('phones').upsert(data, { onConflict: 'url' });
    if (error) throw new Error(error.message);
}

// --- MAIN EXECUTION ---
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
    console.log(`🚀 Kimovil üzerinden ${PHONES_TO_SCRAPE.length} telefon taranacak...`);

    for (const [index, phone] of PHONES_TO_SCRAPE.entries()) {
        console.log(`\n[${index + 1}/${PHONES_TO_SCRAPE.length}] İşleniyor: ${phone.name}`);

        const data = await scrapeKimovil(phone.url);
        if (data) {
            // İsim düzeltme (Kimovil başlıkları uzun olabilir)
            data.name = phone.name;

            try {
                await saveToSupabase(data);
                console.log(`✅ Kaydedildi: ${data.name}`);
            } catch (err) {
                console.error(`❌ Kayıt Hatası: ${err.message}`);
            }
        }

        // 3 saniye bekle
        await delay(3000);
    }

    console.log('\n✨ Tüm işlemler tamamlandı!');
})();
