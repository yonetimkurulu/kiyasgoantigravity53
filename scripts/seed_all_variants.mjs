
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://eupwqhesbcjczsdgkurh.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cHdxaGVzYmNqY3pzZGdrdXJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDgzNzc3NiwiZXhwIjoyMDgwNDEzNzc2fQ.iuyn8M3WvaFhHjXKkqLNRMsjoVARuvy22TIaAM1YJ80";
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// Raw list from app/data.js (Filtered for Phones/Tablets)
const RAW_PRODUCTS = [
    { name: "Apple iPhone 15 Pro", price: 89999, category: "elektronik", sub: "cep-telefonu", image: "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-pro.jpg" },
    { name: "Samsung Galaxy S24 Ultra", price: 84999, category: "elektronik", sub: "cep-telefonu", image: "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-ultra-5g-sm-s928.jpg" },
    { name: "Apple iPhone 15", price: 59999, category: "elektronik", sub: "cep-telefonu", image: "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15.jpg" },
    { name: "Samsung Galaxy S24+", price: 64999, category: "elektronik", sub: "cep-telefonu", image: "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-plus-5g-sm-s926.jpg" },
    { name: "Xiaomi 14 Pro", price: 54999, category: "elektronik", sub: "cep-telefonu", image: "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-14-pro.jpg" },
    { name: "Samsung Galaxy A55 5G", price: 22999, category: "elektronik", sub: "cep-telefonu", image: "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a55.jpg" },
    { name: "Apple iPhone 14", price: 47999, category: "elektronik", sub: "cep-telefonu", image: "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-14.jpg" },
    { name: "Samsung Galaxy Z Fold5", price: 99999, category: "elektronik", sub: "cep-telefonu", image: "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-fold5.jpg" },
    { name: "Xiaomi Redmi Note 13 Pro+ 5G", price: 24999, category: "elektronik", sub: "cep-telefonu", image: "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-13-pro.jpg" },
    { name: "OPPO Reno11 Pro 5G", price: 32999, category: "elektronik", sub: "cep-telefonu", image: "https://fdn2.gsmarena.com/vv/bigpic/oppo-reno11-pro-5g.jpg" },
    { name: "Samsung Galaxy S23 FE", price: 29999, category: "elektronik", sub: "cep-telefonu", image: "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s23-fe.jpg" },
    { name: "Apple iPhone 13", price: 39999, category: "elektronik", sub: "cep-telefonu", image: "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-13.jpg" },
    { name: "Xiaomi Poco X6 Pro 5G", price: 18999, category: "elektronik", sub: "cep-telefonu", image: "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-x6-pro.jpg" },
    { name: "Samsung Galaxy A35 5G", price: 16999, category: "elektronik", sub: "cep-telefonu", image: "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a35.jpg" },
    { name: "Apple iPhone SE (3. Nesil)", price: 21999, category: "elektronik", sub: "cep-telefonu", image: "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-se-2022.jpg" },
    { name: "vivo V30 Pro", price: 34999, category: "elektronik", sub: "cep-telefonu", image: "https://fdn2.gsmarena.com/vv/bigpic/vivo-v30-pro.jpg" },
    { name: "Samsung Galaxy Z Flip5", price: 64999, category: "elektronik", sub: "cep-telefonu", image: "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-flip5.jpg" },
    { name: "Xiaomi 13T Pro", price: 34999, category: "elektronik", sub: "cep-telefonu", image: "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-13t-pro.jpg" },
    { name: "OPPO A78 5G", price: 13999, category: "elektronik", sub: "cep-telefonu", image: "https://fdn2.gsmarena.com/vv/bigpic/oppo-a78.jpg" },
    { name: "Samsung Galaxy M55 5G", price: 18999, category: "elektronik", sub: "cep-telefonu", image: "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m55.jpg" },
    // Tablets
    { name: "Samsung Galaxy Tab S9 Ultra", price: 34999, category: "elektronik", sub: "tablet", image: "" },
    { name: "Apple iPad Pro 12.9\" (M2)", price: 42999, category: "elektronik", sub: "tablet", image: "" },
    { name: "Samsung Galaxy Tab S9+", price: 27999, category: "elektronik", sub: "tablet", image: "" },
    { name: "Apple iPad Air 5", price: 22999, category: "elektronik", sub: "tablet", image: "" },
    { name: "Lenovo Tab P12 Pro", price: 18999, category: "elektronik", sub: "tablet", image: "" },
    { name: "Huawei MatePad Pro 13.2\"", price: 25999, category: "elektronik", sub: "tablet", image: "" },
    { name: "Apple iPad 10. Nesil", price: 14999, category: "elektronik", sub: "tablet", image: "" },
    { name: "Samsung Galaxy Tab A9+", price: 8999, category: "elektronik", sub: "tablet", image: "" },
    { name: "Xiaomi Pad 6", price: 11999, category: "elektronik", sub: "tablet", image: "" },
    { name: "Amazon Fire HD 10", price: 3999, category: "elektronik", sub: "tablet", image: "" }
];

async function run() {
    console.log("Generating variants for ALL devices...");

    for (const product of RAW_PRODUCTS) {
        // Generate 3 variants per product: 128GB, 256GB, 512GB (or similar logic)
        // Adjust prices accordingly.

        // Determine Base Name (clean up quotes etc)
        const baseName = product.name.replace(/"/g, '').trim();

        // Variant 1: 128 GB (Base)
        const v1 = {
            name: `${baseName} 128 GB`,
            slug: `${baseName} 128 GB`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
            price: product.price,
            storage: "128 GB"
        };

        // Variant 2: 256 GB (+15%)
        const v2 = {
            name: `${baseName} 256 GB`,
            slug: `${baseName} 256 GB`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
            price: Math.floor(product.price * 1.15),
            storage: "256 GB"
        };

        // Variant 3: 512 GB (+30%)
        const v3 = {
            name: `${baseName} 512 GB`,
            slug: `${baseName} 512 GB`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
            price: Math.floor(product.price * 1.30),
            storage: "512 GB"
        };

        const variants = [v1, v2, v3];

        for (const v of variants) {
            // Using upsert on slug to prevent duplicates but update if exists
            const { error } = await supabase
                .from('products')
                .upsert({
                    name: v.name,
                    slug: v.slug,
                    price: v.price,
                    image: product.image, // Use base image
                    category: product.category,
                    subcategory: product.sub,
                    rating: 4.5, // Default nice rating
                    desc: `${baseName} - ${v.storage} depolama seçeneği ile.`,
                    specs: {
                        storage: v.storage,
                        ram: "8 GB",
                        name: v.name
                    },
                    store1_name: "PttAVM", // Default store
                    store1_price: v.price,
                    link: "https://www.pttavm.com",
                    updated_at: new Date().toISOString()
                }, { onConflict: 'slug' });

            if (error) console.error(`Error adding ${v.name}:`, error.message);
            else console.log(`Added: ${v.name}`);
        }
    }

    console.log("All variants seeded.");
}

run();
