
import puppeteer from 'puppeteer';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// --- CONFIGURATION ---
const SUPABASE_URL = "https://eupwqhesbcjczsdgkurh.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cHdxaGVzYmNqY3pzZGdrdXJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDgzNzc3NiwiZXhwIjoyMDgwNDEzNzc2fQ.iuyn8M3WvaFhHjXKkqLNRMsjoVARuvy22TIaAM1YJ80";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// --- DYNAMIC CATALOG EXTRACTION ---
function getProductList() {
    try {
        const dataPath = path.join(process.cwd(), 'app', 'data.js');
        const content = fs.readFileSync(dataPath, 'utf-8');

        // BETTER Regex to find "name": "Value" OR name: "Value"
        const matches = [...content.matchAll(/(?:["']?name["']?)\s*:\s*["'](.*?)["']/g)];
        const names = matches.map(m => m[1]);

        // Remove duplicates and generics
        const uniqueNames = [...new Set(names)].filter(n => n.length > 2);

        console.log(`📋 Catalog loaded. Found ${uniqueNames.length} unique products.`);
        return uniqueNames;
    } catch (e) {
        console.error("Critical Error reading data.js:", e.message);
        return [];
    }
}

async function runGoogleBot() {
    const productList = getProductList();
    if (productList.length === 0) return;

    console.log("🚀 Google Bot V3 Starting... (Fixed Regex & Image Selector)");

    // Launch Browser
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--start-maximized', '--disable-blink-features=AutomationControlled']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });

    let count = 0;
    for (const query of productList) {
        count++;
        console.log(`\n[${count}/${productList.length}] 🔍 Processing: ${query}`);
        let price = 0;
        let imageUrl = null;

        try {
            // --- 1. GET PRICE (Shopping Tab Strategy) ---
            await page.goto(`https://www.google.com.tr/search?q=${encodeURIComponent(query)}&tbm=shop&hl=tr`, { waitUntil: 'domcontentloaded' });

            let priceText = await page.evaluate(() => {
                const el = document.querySelector('.HRLxBb, .a8Pemb, .aUlzUe, .OFFNJ, .T4LgNb');
                return el ? el.innerText : null;
            });

            if (!priceText) {
                // Fallback to General Search
                await page.goto(`https://www.google.com.tr/search?q=${encodeURIComponent(query + " fiyat")}&hl=tr`, { waitUntil: 'domcontentloaded' });
                priceText = await page.evaluate(() => {
                    const bigPrice = document.querySelector('.T4LgNb');
                    return bigPrice ? bigPrice.innerText : null;
                });
            }

            if (priceText) {
                const clean = priceText.replace(/TL/i, '').trim().replace(/\./g, '').replace(',', '.');
                price = parseFloat(clean);
                console.log(`   💰 Price: ${price.toLocaleString('tr-TR')} TL`);
            } else {
                console.log("    Price not found.");
            }

            // --- 2. GET IMAGE (Transparent -> Generic Retry) ---
            const findImage = async () => {
                try {
                    // Wait for images container
                    await page.waitForSelector('div[data-q], img.rg_i', { timeout: 3000 });

                    return await page.evaluate(() => {
                        // Priority 1: High Res Preview (clicked item usually) - Hard to automate quickly
                        // Priority 2: Thumbnails in grid
                        const images = Array.from(document.querySelectorAll('div[data-q] img, img.rg_i'));

                        for (const img of images) {
                            // Must be http, avoid data:image/gif;base64 fillers
                            if (img.src && img.src.startsWith('http') && !img.src.includes('gstatic')) return img.src;
                            if (img.dataset.src && img.dataset.src.startsWith('http')) return img.dataset.src;
                            if (img.src && img.src.startsWith('http')) return img.src; // Fallback to gstatic if needed
                        }
                        return null;
                    });
                } catch (e) { return null; }
            };

            // A. Try Transparent PNG
            await page.goto(`https://www.google.com.tr/search?q=${encodeURIComponent(query + " transparent png")}&tbm=isch&tbs=ic:trans`, { waitUntil: 'domcontentloaded' });
            imageUrl = await findImage();

            // B. Retry Generic if failed
            if (!imageUrl) {
                console.log("   ↳ No transparent img, retrying broad...");
                await page.goto(`https://www.google.com.tr/search?q=${encodeURIComponent(query)}&tbm=isch`, { waitUntil: 'domcontentloaded' });
                imageUrl = await findImage();
            }

            // --- 3. SAVE TO SUPABASE ---
            if (imageUrl) {
                try {
                    const fileName = `products/${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
                    const viewSource = await page.goto(imageUrl);
                    const buffer = await viewSource.buffer();

                    const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, buffer, { contentType: 'image/png', upsert: true });

                    if (!uploadError) {
                        const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
                        imageUrl = data.publicUrl;
                        console.log("   ☁️  Image Uploaded.");
                    }
                } catch (err) { }
            }

            if (imageUrl || price > 0) {
                const payload = {
                    name: query,
                    source: 'google',
                    updated_at: new Date().toISOString()
                };
                if (price > 0) payload.price = price;
                if (imageUrl && imageUrl.startsWith('http')) payload.image = imageUrl;

                await supabase.from('products').upsert(payload, { onConflict: 'name' });
            }

        } catch (error) {
            console.error(`   ❌ Error: ${error.message}`);
        }

        await new Promise(r => setTimeout(r, 500));
    }

    console.log("\n✨ Mission Complete: All products processed.");
    await browser.close();
}

runGoogleBot();
