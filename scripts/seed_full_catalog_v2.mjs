
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://eupwqhesbcjczsdgkurh.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cHdxaGVzYmNqY3pzZGdrdXJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDgzNzc3NiwiZXhwIjoyMDgwNDEzNzc2fQ.iuyn8M3WvaFhHjXKkqLNRMsjoVARuvy22TIaAM1YJ80";
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const PHONES = [
    { name: "Apple iPhone 15 Pro", storage: ["128 GB", "256 GB", "512 GB", "1 TB"], price: 89999, img: "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-pro.jpg" },
    { name: "Apple iPhone 15", storage: ["128 GB", "256 GB", "512 GB"], price: 58499, img: "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15.jpg" },
    { name: "Apple iPhone 14", storage: ["128 GB", "256 GB", "512 GB"], price: 47999, img: "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-14.jpg" },
    { name: "Apple iPhone 13", storage: ["128 GB", "256 GB", "512 GB"], price: 39999, img: "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-13.jpg" },
    { name: "Samsung Galaxy S24 Ultra", storage: ["256 GB", "512 GB", "1 TB"], price: 84999, img: "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-ultra-5g-sm-s928.jpg" },
    { name: "Samsung Galaxy S24+", storage: ["256 GB", "512 GB"], price: 64999, img: "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-plus-5g-sm-s926.jpg" },
    { name: "Samsung Galaxy S23 FE", storage: ["128 GB", "256 GB"], price: 24999, img: "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s23-fe.jpg" },
    { name: "Samsung Galaxy A55 5G", storage: ["128 GB", "256 GB"], price: 19499, img: "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a55.jpg" },
    { name: "Xiaomi 14 Ultra", storage: ["512 GB", "1 TB"], price: 69999, img: "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-14-ultra.jpg" },
    { name: "Xiaomi Redmi Note 13 Pro+ 5G", storage: ["256 GB", "512 GB"], price: 21999, img: "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-13-pro-plus-5g.jpg" }
];

const TABLETS = [
    { name: "Apple iPad Pro 13 (M4)", storage: ["256 GB", "512 GB", "1 TB", "2 TB"], price: 69999, img: "https://fdn2.gsmarena.com/vv/bigpic/apple-ipad-pro-13-2024.jpg" },
    { name: "Apple iPad Air 13 (M2)", storage: ["128 GB", "256 GB", "512 GB", "1 TB"], price: 42999, img: "https://fdn2.gsmarena.com/vv/bigpic/apple-ipad-air-13-2024.jpg" },
    { name: "Apple iPad 10. Nesil", storage: ["64 GB", "256 GB"], price: 14999, img: "https://fdn2.gsmarena.com/vv/bigpic/apple-ipad-10-2022.jpg" },
    { name: "Samsung Galaxy Tab S9 Ultra", storage: ["256 GB", "512 GB", "1 TB"], price: 44999, img: "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-tab-s9-ultra.jpg" },
    { name: "Samsung Galaxy Tab S9 FE", storage: ["128 GB", "256 GB"], price: 9999, img: "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-tab-s9-fe.jpg" },
    { name: "Samsung Galaxy Tab A9+", storage: ["64 GB", "128 GB"], price: 5499, img: "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-tab-a9-plus.jpg" }
];

const STORES = [
    { name: "PttAVM", link: "https://www.pttavm.com" },
    { name: "Trendyol", link: "https://www.trendyol.com" },
    { name: "Amazon", link: "https://www.amazon.com.tr" },
    { name: "Hepsiburada", link: "https://www.hepsiburada.com" },
    { name: "N11", link: "https://www.n11.com" },
    { name: "MediaMarkt", link: "https://www.mediamarkt.com.tr" }
];

function generateSlug(name) {
    return name.toLowerCase()
        .replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
}

async function seed() {
    console.log("Seeding Full Catalog v2...");

    const allProducts = [];

    // Process Phones
    PHONES.forEach(p => {
        p.storage.forEach((s, i) => {
            // Price increments for storage
            const variantPrice = p.price + (i * 3000); // Simple heuristic

            // Random Store
            const storeSeed = (p.name + s).length;
            const store = STORES[storeSeed % STORES.length];

            allProducts.push({
                name: `${p.name} ${s}`,
                slug: generateSlug(`${p.name} ${s}`),
                category: 'elektronik',
                subcategory: 'cep-telefonu',
                price: variantPrice,
                image: p.img,
                desc: `${p.name}, ${s} depolama seçeneği ile yüksek performans sunar.`,
                rating: 4.5 + (Math.random() * 0.5),
                source: store.name, // Map store1 to source
                // store1_name: store.name,
                // store1_price: variantPrice,
                link: store.link,
                // specs: {
                //     storage: s,
                //     display: "6.1 inç OLED",
                //     battery: "3200 mAh",
                //     ram: "8 GB RAM",
                //     networks: ["5G, 4G LTE"]
                // }
            });
        });
    });

    // Process Tablets
    TABLETS.forEach(p => {
        p.storage.forEach((s, i) => {
            const variantPrice = p.price + (i * 4000);
            const store = STORES[Math.floor(Math.random() * STORES.length)];

            allProducts.push({
                name: `${p.name} ${s}`,
                slug: generateSlug(`${p.name} ${s}`),
                category: 'elektronik',
                subcategory: 'tablet',
                price: variantPrice,
                image: p.img,
                desc: `${p.name}, ${s} depolama kapasitesiyle yaratıcılığınızı artırır.`,
                rating: 4.6,
                source: store.name,
                // store1_name: store.name,
                // store1_price: variantPrice,
                link: store.link,
                // specs: {
                //     storage: s,
                //     display: "10.9 inç Retina",
                //     battery: "8000 mAh",
                //     ram: "8 GB RAM",
                //     networks: ["Wi-Fi", "5G"]
                // }
            });
        });
    });

    console.log(`Preparing to insert ${allProducts.length} variants...`);

    const { error } = await supabase.from('products').upsert(allProducts, { onConflict: 'slug' });

    if (error) {
        console.error("Seed Error:", error);
    } else {
        console.log("Success! Database populated with correct GB/TB variants.");
    }
}

seed();
