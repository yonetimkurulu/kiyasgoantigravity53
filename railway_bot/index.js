const scrapeGoogle = require('./scrapers/google');
const scrapeAkakce = require('./scrapers/akakce');
const scrapeCimri = require('./scrapers/cimri');
const saveProduct = require('./saveProduct');
const productList = require('./productList');

async function processProduct(productName) {
    console.log(`\n🔍 Searching: ${productName}`);

    let data = null;

    // 1. Try Google
    data = await scrapeGoogle(productName);
    if (data && data.price) {
        console.log(`   🌟 Found on Google: ${data.price} TL`);
    } else {
        // 2. Fallback to Akakce
        console.log(`   ⚠️ Google failed, trying Akakce...`);
        data = await scrapeAkakce(productName);
        if (data && data.price) {
            console.log(`   🌟 Found on Akakce: ${data.price} TL`);
        } else {
            // 3. Fallback to Cimri
            console.log(`   ⚠️ Akakce failed, trying Cimri...`);
            data = await scrapeCimri(productName);
            if (data && data.price) {
                console.log(`   🌟 Found on Cimri: ${data.price} TL`);
            }
        }
    }

    if (data && data.price) {
        // Prepare final object
        const finalData = {
            name: productName,
            price: data.price,
            image_url: data.image_url,
            source_link: data.source_link
        };
        await saveProduct(finalData);
    } else {
        console.log(`   ❌ Failed to find price for ${productName} on all sources.`);
        // Note: We do nothing, letting Next.js handle "null" or AI estimation if needed by just not updating DB
    }
}

async function runAll() {
    console.log("🚀 Starting Full Catalog Update...");
    const start = Date.now();

    for (const product of productList) {
        await processProduct(product);
        // Random delay between products (500-1200ms)
        const delay = Math.floor(Math.random() * 700) + 500;
        await new Promise(r => setTimeout(r, delay));
    }

    const duration = ((Date.now() - start) / 1000).toFixed(2);
    console.log(`\n✨ Update Finished in ${duration}s`);
}

// Allow running directly: node index.js
if (require.main === module) {
    runAll();
}

module.exports = { runAll };
