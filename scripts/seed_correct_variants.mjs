
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://eupwqhesbcjczsdgkurh.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cHdxaGVzYmNqY3pzZGdrdXJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDgzNzc3NiwiZXhwIjoyMDgwNDEzNzc2fQ.iuyn8M3WvaFhHjXKkqLNRMsjoVARuvy22TIaAM1YJ80";
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const VARIANT_CONFIGS = {
    "Apple iPhone 15 Pro": ["128 GB", "256 GB", "512 GB", "1 TB"],
    "Samsung Galaxy S24 Ultra": ["256 GB", "512 GB", "1 TB"],
    "Apple iPhone 15": ["128 GB", "256 GB", "512 GB"],
    "Samsung Galaxy S24+": ["256 GB", "512 GB"],
    "Xiaomi 14 Pro": ["256 GB", "512 GB", "1 TB"],
    "Samsung Galaxy A55 5G": ["128 GB", "256 GB"],
    "Apple iPhone 14": ["128 GB", "256 GB", "512 GB"],
    "Samsung Galaxy Z Fold5": ["256 GB", "512 GB", "1 TB"],
    "Xiaomi Redmi Note 13 Pro+ 5G": ["256 GB", "512 GB"],
    "OPPO Reno11 Pro 5G": ["256 GB", "512 GB"],
    "Samsung Galaxy S23 FE": ["128 GB", "256 GB"],
    "Apple iPhone 13": ["128 GB", "256 GB", "512 GB"],
    "Xiaomi Poco X6 Pro 5G": ["256 GB", "512 GB"],
    "Samsung Galaxy A35 5G": ["128 GB", "256 GB"],
    "Apple iPhone SE (3. Nesil)": ["64 GB", "128 GB", "256 GB"],
    "vivo V30 Pro": ["256 GB", "512 GB"],
    "Samsung Galaxy Z Flip5": ["256 GB", "512 GB"],
    "Xiaomi 13T Pro": ["256 GB", "512 GB", "1 TB"],
    "OPPO A78 5G": ["128 GB"],
    "Samsung Galaxy M55 5G": ["128 GB", "256 GB"],
    "Samsung Galaxy Tab S9 Ultra": ["256 GB", "512 GB", "1 TB"],
    "Apple iPad Pro 12.9\" (M2)": ["128 GB", "256 GB", "512 GB", "1 TB", "2 TB"],
    "Samsung Galaxy Tab S9+": ["256 GB", "512 GB"],
    "Apple iPad Air 5": ["64 GB", "256 GB"],
    "Lenovo Tab P12 Pro": ["128 GB", "256 GB"],
    "Huawei MatePad Pro 13.2\"": ["256 GB", "512 GB"],
    "Apple iPad 10. Nesil": ["64 GB", "256 GB"],
    "Samsung Galaxy Tab A9+": ["64 GB", "128 GB"],
    "Xiaomi Pad 6": ["128 GB", "256 GB"],
    "Amazon Fire HD 10": ["32 GB", "64 GB"]
};

// Raw list to iterate over (subset for matching)
const PRODUCTS = [
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
    { name: "Samsung Galaxy Tab S9 Ultra", price: 34999, category: "elektronik", sub: "tablet" },
    { name: "Apple iPad Pro 12.9\" (M2)", price: 42999, category: "elektronik", sub: "tablet" },
    { name: "Samsung Galaxy Tab S9+", price: 27999, category: "elektronik", sub: "tablet" },
    { name: "Apple iPad Air 5", price: 22999, category: "elektronik", sub: "tablet" },
    { name: "Lenovo Tab P12 Pro", price: 18999, category: "elektronik", sub: "tablet" },
    { name: "Huawei MatePad Pro 13.2\"", price: 25999, category: "elektronik", sub: "tablet" },
    { name: "Apple iPad 10. Nesil", price: 14999, category: "elektronik", sub: "tablet" },
    { name: "Samsung Galaxy Tab A9+", price: 8999, category: "elektronik", sub: "tablet" },
    { name: "Xiaomi Pad 6", price: 11999, category: "elektronik", sub: "tablet" },
    { name: "Amazon Fire HD 10", price: 3999, category: "elektronik", sub: "tablet" }
];

async function run() {
    console.log("Seeding Correct Variants (Minimal Mode)...");

    for (const product of PRODUCTS) {
        const definedVariants = VARIANT_CONFIGS[product.name];
        if (!definedVariants) continue;

        const baseName = product.name.replace(/"/g, '').trim();

        const storageSize = (s) => {
            if (s.includes('TB')) return parseInt(s) * 1024;
            return parseInt(s);
        };

        const sortedVariants = [...definedVariants].sort((a, b) => storageSize(a) - storageSize(b));
        const baseStorage = sortedVariants[0];

        for (const storage of sortedVariants) {
            let price = product.price;

            if (storage !== baseStorage) {
                const baseSize = storageSize(baseStorage);
                const currentSize = storageSize(storage);

                if (currentSize > baseSize * 4) price = Math.floor(product.price * 1.50);
                else if (currentSize > baseSize * 2) price = Math.floor(product.price * 1.30);
                else if (currentSize > baseSize) price = Math.floor(product.price * 1.15);
            }

            const variantSlug = `${baseName} ${storage}`.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');

            const variantName = `${baseName} ${storage}`;

            // UPSERT WITH MINIMAL COLUMNS
            const { error } = await supabase
                .from('products')
                .upsert({
                    name: variantName,
                    slug: variantSlug,
                    price: price,
                    image: product.image || "https://example.com/placeholder.jpg",
                    category: product.category,
                    subcategory: product.sub,
                    rating: 4.6,
                    desc: `${baseName} - ${storage}`,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'slug' });

            if (error) console.error(`Error adding ${variantName}:`, error.message);
            else console.log(`Added: ${variantName}`);
        }
    }

    console.log("Minimal variant seeding complete.");
}

run();
