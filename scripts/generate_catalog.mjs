
import fs from 'fs';
import path from 'path';
import https from 'https';

const DEEPSEEK_API_KEY = "sk-1e81320545394848bd958290597c3164";

const CATEGORIES = [
    { id: "cep-telefonu", label: "Cep Telefonu", count: 20 },
    { id: "televizyon", label: "Televizyon", count: 10 },
    { id: "monitor", label: "Monitör", count: 10 },
    { id: "bluetooth-kulaklik", label: "Bluetooth Kulaklık", count: 10 },
    { id: "ekran-karti", label: "Ekran Kartı", count: 10 },
    { id: "dikey-supurge", label: "Dikey Süpürge", count: 10 },
    { id: "tablet", label: "Tablet", count: 10 },
    { id: "laptop", label: "Laptop ve Notebook", count: 10 },
    { id: "oyun-bilgisayari", label: "Oyun Bilgisayarı", count: 10 },
    { id: "robot-supurge", label: "Robot Süpürge", count: 10 },
    { id: "akilli-saat", label: "Akıllı Saat", count: 10 },
    { id: "kurutma-makinesi", label: "Kurutma Makinesi", count: 10 },
];

async function fetchCategoryData(category) {
    console.log(`Fetching data for: ${category.label}...`);

    const prompt = `
    List the top ${category.count} most popular "${category.label}" models currently in the Turkish market.
    
    For each product, provide:
    1. "id": logic slug (e.g., "iphone-15-pro")
    2. "name": Full product name
    3. "price": Approximate price in try (Just the number, e.g., 50000)
    4. "image": A REAL, WORKING public image URL (e.g., from GSMArena, Apple, Samsung, Amazon, or a stable CDN). Do NOT use placeholder URLs.
    5. "desc": A short, catchy description (max 10 words) in Turkish.
    6. "rating": A random rating between 4.0 and 5.0 (e.g., 4.7)

    Return ONLY a raw JSON array. Do not include markdown formatting or explanations.
    Example:
    [
        { "id": "example-prod", "name": "Example Product", "price": 10000, "image": "https://...", "desc": "Great product.", "rating": 4.5 }
    ]
    `;

    const data = JSON.stringify({
        model: "deepseek-chat",
        messages: [
            { role: "system", content: "You are a JSON generator. output only raw valid json array." },
            { role: "user", content: prompt }
        ],
        stream: false
    });

    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.deepseek.com',
            path: '/chat/completions',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                'Content-Length': data.length
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(body);
                    let content = response.choices[0].message.content;
                    // Clean code blocks
                    content = content.replace(/```json/g, '').replace(/```/g, '').trim();
                    const products = JSON.parse(content);

                    // Post-process to ensure valid structure
                    const processed = products.map(p => ({
                        ...p,
                        category: 'elektronik',
                        subcategory: category.id
                    }));

                    resolve(processed);
                } catch (e) {
                    console.error(`Error parsing ${category.label}:`, e);
                    resolve([]); // Return empty to not break the chain
                }
            });
        });

        req.on('error', (e) => {
            console.error(`Request error for ${category.label}:`, e);
            reject(e);
        });

        req.write(data);
        req.end();
    });
}

async function main() {
    const allProducts = [];

    // Process sequentially to be nice to IP limits and logic
    for (const cat of CATEGORIES) {
        try {
            const products = await fetchCategoryData(cat);
            if (products.length > 0) {
                console.log(`✓ Fetched ${products.length} items for ${cat.label}`);
                allProducts.push(...products);
            } else {
                console.log(`✗ Failed to get items for ${cat.label} (using fallback or empty)`);
            }
        } catch (err) {
            console.error(err);
        }
        // Small delay
        await new Promise(r => setTimeout(r, 1000));
    }

    // Write to file
    fs.writeFileSync('generated_products.json', JSON.stringify(allProducts, null, 2));
    console.log(`\nSuccessfully saved ${allProducts.length} products to generated_products.json`);
}

main();
