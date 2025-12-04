
import axios from 'axios';
import * as cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURATION ---
const TARGET_URL = "https://www.gsmarena.com/apple_iphone_15_pro-12557.php";
const SUPABASE_URL = "https://eupwqhesbcjczsdgkurh.supabase.co";
// Service Role Key (Admin Write Access)
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cHdxaGVzYmNqY3pzZGdrdXJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDgzNzc3NiwiZXhwIjoyMDgwNDEzNzc2fQ.iuyn8M3WvaFhHjXKkqLNRMsjoVARuvy22TIaAM1YJ80";

// --- SCRAPER LOGIC ---
async function scrapeGsmArena(url) {
    console.log(`Scraping: ${url}`);
    try {
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const $ = cheerio.load(data);
        const name = $('h1.specs-phone-name-title').text().trim();
        const image = $('.specs-photo-main img').attr('src');
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
        console.error('Scraping hatası:', error.message);
        throw error;
    }
}

// --- DATABASE LOGIC ---
async function saveToSupabase(data) {
    console.log('Saving to Supabase...');
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const { error } = await supabase
        .from('phones')
        .upsert(data, { onConflict: 'url' });

    if (error) {
        throw new Error('Supabase Error: ' + error.message);
    }
    console.log('✅ Başarıyla kaydedildi!');
}

// --- MAIN EXECUTION ---
(async () => {
    try {
        const data = await scrapeGsmArena(TARGET_URL);
        console.log('Scraped Data:', data.name);
        await saveToSupabase(data);
    } catch (error) {
        console.error('❌ HATA:', error.message);
    }
})();
