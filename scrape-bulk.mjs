
import axios from 'axios';
import * as cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURATION ---
const SUPABASE_URL = "https://eupwqhesbcjczsdgkurh.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cHdxaGVzYmNqY3pzZGdrdXJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDgzNzc3NiwiZXhwIjoyMDgwNDEzNzc2fQ.iuyn8M3WvaFhHjXKkqLNRMsjoVARuvy22TIaAM1YJ80";

const PHONES_TO_SCRAPE = [
    { name: "iPhone 17 Pro", url: "https://www.gsmarena.com/apple_iphone_17_pro-14049.php" },
    { name: "iPhone 16 Pro", url: "https://www.gsmarena.com/apple_iphone_16_pro-13106.php" },
    { name: "Samsung S25 Ultra", url: "https://www.gsmarena.com/samsung_galaxy_s25_ultra-12822.php" },
    { name: "iPhone 15 Pro", url: "https://www.gsmarena.com/apple_iphone_15_pro-12548.php" },
    { name: "Samsung S24 Ultra", url: "https://www.gsmarena.com/samsung_galaxy_s24_ultra-12771.php" },
    { name: "iPhone 14", url: "https://www.gsmarena.com/apple_iphone_14-11861.php" },
    { name: "iPhone 13", url: "https://www.gsmarena.com/apple_iphone_13-11103.php" },
    { name: "Samsung S23 FE", url: "https://www.gsmarena.com/samsung_galaxy_s23_fe-12502.php" },
    { name: "Xiaomi 13T Pro", url: "https://www.gsmarena.com/xiaomi_13t_pro-12388.php" },
    { name: "Redmi Note 13 Pro", url: "https://www.gsmarena.com/xiaomi_redmi_note_13_pro-12581.php" },
    { name: "Huawei P60 Pro", url: "https://www.gsmarena.com/huawei_p60_pro-12172.php" },
    { name: "Honor 90", url: "https://www.gsmarena.com/honor_90-12330.php" },
    { name: "Nothing Phone (2)", url: "https://www.gsmarena.com/nothing_phone_(2)-12386.php" },
    { name: "Realme 11 Pro+", url: "https://www.gsmarena.com/realme_11_pro+-12246.php" },
    { name: "POCO F5", url: "https://www.gsmarena.com/xiaomi_poco_f5-12248.php" },
    { name: "Samsung A54", url: "https://www.gsmarena.com/samsung_galaxy_a54-12070.php" },
    { name: "iPhone 11", url: "https://www.gsmarena.com/apple_iphone_11-9842.php" }
];

// --- SCRAPER LOGIC ---
async function scrapeGsmArena(url) {
    try {
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const $ = cheerio.load(data);
        const name = $('h1.specs-phone-name-title').text().trim();
        const image = $('.specs-photo-main img').attr('src');

        // Specs extraction
        const displayType = $('[data-spec="displaytype"]').text().trim();
        const displaySize = $('[data-spec="displaysize"]').text().trim();
        const displayRes = $('[data-spec="displayresolution"]').text().trim();
        const display = `${displayType}, ${displaySize}, ${displayRes}`;

        const memoryString = $('[data-spec="internalmemory"]').text().trim();
        const memoryOptions = memoryString.split(',').map(s => s.trim());
        const storageOptions = [];
        const ramOptions = [];
        memoryOptions.forEach(opt => {
            const parts = opt.split(' ');
            const storage = parts[0];
            const ram = parts.slice(1).join(' ').replace('RAM', '').trim();
            if (storage && !storageOptions.includes(storage)) storageOptions.push(storage);
            if (ram && !ramOptions.includes(ram)) ramOptions.push(ram);
        });

        const mainCamera = $('[data-spec="cam1modules"]').text().trim().replace(/\n/g, ' ').replace(/\s+/g, ' ');
        const selfieCamera = $('[data-spec="cam2modules"]').text().trim().replace(/\n/g, ' ').replace(/\s+/g, ' ');
        const camera = `Main: ${mainCamera} | Selfie: ${selfieCamera}`;
        const battery = $('[data-spec="batdescription1"]').text().trim();

        const networks = [];
        if ($('.tr-toggle').text().includes('5G')) networks.push('5G');
        if ($('.tr-toggle').text().includes('4G') || $('.tr-toggle').text().includes('LTE')) networks.push('4G');
        if ($('.tr-toggle').text().includes('3G')) networks.push('3G');
        if ($('.tr-toggle').text().includes('GSM')) networks.push('2G');

        const price = $('[data-spec="price"]').text().trim();

        return {
            name, image, display, storage: storageOptions, ram: ramOptions, camera, battery, networks, price, url
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
    console.log(`🚀 Toplam ${PHONES_TO_SCRAPE.length} telefon taranacak...`);

    for (const [index, phone] of PHONES_TO_SCRAPE.entries()) {
        console.log(`\n[${index + 1}/${PHONES_TO_SCRAPE.length}] İşleniyor: ${phone.name}`);

        const data = await scrapeGsmArena(phone.url);
        if (data) {
            try {
                await saveToSupabase(data);
                console.log(`✅ Kaydedildi: ${data.name}`);
            } catch (err) {
                console.error(`❌ Kayıt Hatası: ${err.message}`);
            }
        }

        // 2 saniye bekle (rate limit yememek için)
        await delay(2000);
    }

    console.log('\n✨ Tüm işlemler tamamlandı!');
})();
