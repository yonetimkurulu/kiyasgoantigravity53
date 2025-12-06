
import puppeteer from 'puppeteer';
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURATION ---
const SUPABASE_URL = "https://eupwqhesbcjczsdgkurh.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cHdxaGVzYmNqY3pzZGdrdXJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDgzNzc3NiwiZXhwIjoyMDgwNDEzNzc2fQ.iuyn8M3WvaFhHjXKkqLNRMsjoVARuvy22TIaAM1YJ80";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// Full catalog list extracted from data.js
const PRODUCT_LIST = [
    // --- PHONES ---
    'iPhone 15 Pro',
    'Samsung Galaxy S24 Ultra',
    'iPhone 15',
    'Samsung Galaxy S24 Plus',
    'Xiaomi 14 Pro',
    'Samsung Galaxy A55 5G',
    'iPhone 14',
    'Samsung Galaxy Z Fold5',
    'Xiaomi Redmi Note 13 Pro+ 5G',
    'OPPO Reno11 Pro 5G',
    'Samsung Galaxy S23 FE',
    'iPhone 13',
    'Xiaomi Poco X6 Pro 5G',
    'Samsung Galaxy A35 5G',
    'iPhone SE 3. Nesil',
    'vivo V30 Pro',
    'Samsung Galaxy Z Flip5',
    'Xiaomi 13T Pro',
    'Samsung Galaxy M55 5G',

    // --- TV ---
    'Samsung 65" QLED 4K QN90C',
    'LG 55" OLED 4K evo C3',
    'Vestel 65" 4K UHD Smart TV 65U9500',
    'Philips 55" OLED+ 4K 808',
    'Samsung 55" Crystal 4K AU8000',
    'LG 75" NanoCell 4K 75NANO76SRA',
    'Arçelik 55" OLED Pro',
    'Xiaomi Mi TV P1 55"',
    'Toshiba 55" 4K UHD 55V35KE',
    'Sony 65" Bravia XR X90L',

    // --- TABLET ---
    'Samsung Galaxy Tab S9 Ultra',
    'Apple iPad Pro 12.9" M2',
    'Samsung Galaxy Tab S9+',
    'Apple iPad Air 5',
    'Lenovo Tab P12 Pro',
    'Huawei MatePad Pro 13.2',
    'Apple iPad 10. Nesil',
    'Samsung Galaxy Tab A9+',
    'Xiaomi Pad 6',
    'Amazon Fire HD 10',

    // --- LAPTOP ---
    'Apple MacBook Air M2 13.6 inç',
    'Lenovo IdeaPad Gaming 3 15.6',
    'HP Pavilion 15-eg2007nt',
    'ASUS ROG Strix G15',
    'Acer Nitro 5 AN515-58',
    'Dell Inspiron 15 3520',
    'MSI Katana GF66',
    'Apple MacBook Pro 14 M3',
    'ASUS Vivobook Pro 15 OLED',
    'Lenovo ThinkPad E15 Gen 4',

    // --- OTHER & HOME ---
    'Dyson Gen5detect',
    'Roborock S8 Pro Ultra',
    'PlayStation 5',
    'AirPods Pro 2. Nesil',
    'MSI GeForce RTX 4090',
    'Apple Watch Ultra 2',
    'Samsung Galaxy Watch 6 Classic',
    'Philips Airfryer XXL'
];

async function runGoogleBot() {
    console.log("🚀 Google Bot Starting... (Targeting Transparent PNGs & Full Catalog)");

    // Launch Browser
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--start-maximized', '--disable-blink-features=AutomationControlled']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });

    for (const query of PRODUCT_LIST) {
        console.log(`\n🔍 Processing: ${query}`);
        let price = 0;
        let imageUrl = null;

        try {
            // 1. GET PRICE from Google Search (Only if needed or to update)
            await page.goto(`https://www.google.com.tr/search?q=${encodeURIComponent(query + " fiyat")}&hl=tr`, { waitUntil: 'domcontentloaded' });

            const priceText = await page.evaluate(() => {
                const bigPrice = document.querySelector('.T4LgNb');
                if (bigPrice) return bigPrice.innerText;
                const bodyText = document.body.innerText;
                const match = bodyText.match(/(\d{1,3}(\.\d{3})*,\d{0,2})\s*TL/);
                return match ? match[0] : null;
            });

            if (priceText) {
                const clean = priceText.replace(/TL/i, '').trim().replace(/\./g, '').replace(',', '.');
                price = parseFloat(clean);
                console.log(`💰 Price found: ${price} TL`);
            }

            // 2. GET IMAGE from Google Images (With "transparent png" focus)
            const imageQuery = `${query} transparent png`; // Add keyword
            await page.goto(`https://www.google.com.tr/search?q=${encodeURIComponent(imageQuery)}&tbm=isch&tbs=ic:trans`, { waitUntil: 'domcontentloaded' });
            // tbs=ic:trans filters for transparent background in Google Images tools!

            try {
                await page.waitForSelector('div[data-q]', { timeout: 3000 });

                // Try to click first few images to find a good one
                const images = await page.$$('div[data-q] img');

                for (let i = 0; i < Math.min(images.length, 3); i++) {
                    const src = await page.evaluate(img => img.src, images[i]);
                    if (src && src.startsWith('http')) {
                        imageUrl = src;
                        break;
                    }
                }
                console.log("📸 Image candidate found.");

            } catch (e) {
                console.log("⚠️ Image timeout.");
            }

            // --- SAVE TO SUPABASE ---
            if (imageUrl) {
                try {
                    // Determine content type roughly
                    let contentType = 'image/png'; // Assume png due to query
                    const fileName = `products/${Date.now()}-${Math.random().toString(36).substring(7)}.png`;

                    // Direct upload logic
                    // Note: Downloading transparent images correctly via puppeteer buffer
                    // might need converting, but we'll try direct buffer.
                    const viewSource = await page.goto(imageUrl);
                    const buffer = await viewSource.buffer();

                    const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, buffer, { contentType, upsert: true });

                    if (!uploadError) {
                        const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
                        imageUrl = data.publicUrl;
                        console.log("☁️  Uploaded clean image.");
                    }
                } catch (err) {
                    console.error("🖼️ Upload fail:", err.message);
                }
            }

            // Database Update
            if (imageUrl || price > 0) {
                const payload = {
                    name: query,
                    source: 'google',
                    updated_at: new Date().toISOString()
                };
                // Only update what we found to avoid overwriting good data with 0
                if (price > 0) payload.price = price;
                // Always update image because user specifically asked for fixes
                if (imageUrl && imageUrl.startsWith('http')) payload.image = imageUrl;

                const { error: dbError } = await supabase.from('products').upsert(payload, { onConflict: 'name' });
                if (!dbError) console.log("💾 Database Updated");
            }

        } catch (error) {
            console.error(`❌ Error on ${query}:`, error.message);
        }

        await new Promise(r => setTimeout(r, 1000));
    }

    console.log("✨ Full Catalog Update Finished!");
    await browser.close();
}

runGoogleBot();
