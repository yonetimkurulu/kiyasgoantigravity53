
import puppeteer from 'puppeteer';
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURATION ---
const SUPABASE_URL = "https://eupwqhesbcjczsdgkurh.supabase.co";
// Using the Service Key we already established is safe for this local context
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cHdxaGVzYmNqY3pzZGdrdXJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDgzNzc3NiwiZXhwIjoyMDgwNDEzNzc2fQ.iuyn8M3WvaFhHjXKkqLNRMsjoVARuvy22TIaAM1YJ80";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const PRODUCT_LIST = [
    'iPhone 15 Pro',
    'Samsung Galaxy S24 Ultra',
    'iPhone 14',
    'Samsung Galaxy A55',
    'Redmi Note 13 Pro',
    'Poco X6 Pro',
    'iPhone 13',
    'Samsung Galaxy S23 FE',
    'Dyson Gen5detect',
    'Roborock S8',
    'PlayStation 5',
    'AirPods Pro 2',
    'MacBook Air M2',
    'LG OLED C3',
    'Philips Airfryer XXL'
];

async function runGoogleBot() {
    console.log("🚀 Google Bot Starting... (Finding prices & images)");

    // Launch Browser
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--start-maximized', '--disable-blink-features=AutomationControlled'] // Hides bot status slightly
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });

    for (const query of PRODUCT_LIST) {
        console.log(`\n🔍 Processing: ${query}`);
        let price = 0;
        let imageUrl = null;
        let productLink = null;

        try {
            // 1. GET PRICE from Google Search
            await page.goto(`https://www.google.com.tr/search?q=${encodeURIComponent(query + " fiyat")}&hl=tr`, { waitUntil: 'domcontentloaded' });

            // Try to find price in rich snippets or shopping commands
            const priceText = await page.evaluate(() => {
                // Strategy 1: The big number in shopping card
                const bigPrice = document.querySelector('.T4LgNb');
                if (bigPrice) return bigPrice.innerText;

                // Strategy 2: First organic result that looks like a price
                // Regex for price: \d{2,3}\.\d{3} TL
                const bodyText = document.body.innerText;
                const match = bodyText.match(/(\d{1,3}(\.\d{3})*,\d{0,2})\s*TL/);
                return match ? match[0] : null;
            });

            if (priceText) {
                // Clean price string: "55.999,00 TL" -> 55999.00
                const clean = priceText.replace(/TL/i, '').trim().replace(/\./g, '').replace(',', '.');
                price = parseFloat(clean);
                console.log(`💰 Price found: ${price} TL`);
            } else {
                console.log("⚠️ Price not found, defaulting to 0 or keeping old.");
            }

            // 2. GET IMAGE from Google Images
            // We search for "Product Name white background" to try to get clean images
            await page.goto(`https://www.google.com.tr/search?q=${encodeURIComponent(query)}&tbm=isch`, { waitUntil: 'domcontentloaded' });

            // Click first image to get higher res
            try {
                // Wait for first image grid item
                await page.waitForSelector('div[data-q]', { timeout: 3000 });
                const firstImg = await page.$('div[data-q] img');

                if (firstImg) {
                    imageUrl = await page.evaluate(img => img.src, firstImg);
                    productLink = page.url(); // Just use google images link as reference
                    console.log("📸 Image found.");
                }
            } catch (e) {
                console.log("⚠️ Image timeout.");
            }

            // --- SAVE TO SUPABASE ---
            if (imageUrl) {
                // Upload Image Logic
                try {
                    const start = Date.now();
                    // Check if base64 or url
                    let buffer;
                    let contentType = 'image/jpeg';

                    if (imageUrl.startsWith('data:')) {
                        const matches = imageUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                        if (matches) {
                            contentType = matches[1];
                            buffer = Buffer.from(matches[2], 'base64');
                        }
                    } else {
                        const viewSource = await page.goto(imageUrl);
                        buffer = await viewSource.buffer();
                    }

                    if (buffer) {
                        const fileName = `products/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
                        const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, buffer, { contentType, upsert: true });

                        if (!uploadError) {
                            const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
                            imageUrl = data.publicUrl;
                        }
                    }
                } catch (err) {
                    console.error("🖼️ Upload fail:", err.message);
                }
            }

            // Database Update
            if (price > 0 || imageUrl) {
                const payload = {
                    name: query,
                    source: 'google',
                    updated_at: new Date().toISOString()
                };
                if (price > 0) payload.price = price;
                if (imageUrl && imageUrl.startsWith('http')) payload.image = imageUrl;

                const { error: dbError } = await supabase.from('products').upsert(payload, { onConflict: 'name' });
                if (!dbError) console.log("💾 Saved to DB");
                else console.error("💾 DB Error:", dbError.message);
            }

        } catch (error) {
            console.error(`❌ Error on ${query}:`, error.message);
        }

        // Delay to look human
        await new Promise(r => setTimeout(r, 1500));
    }

    console.log("✨ Google Bot Finished!");
    await browser.close();
}

runGoogleBot();
