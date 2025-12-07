
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://eupwqhesbcjczsdgkurh.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cHdxaGVzYmNqY3pzZGdrdXJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDgzNzc3NiwiZXhwIjoyMDgwNDEzNzc2fQ.iuyn8M3WvaFhHjXKkqLNRMsjoVARuvy22TIaAM1YJ80";
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const products = [
    // --- IPHONE 15 SERIES ---
    { name: "iPhone 15 128 GB", base: "iPhone 15", price: 54999, storage: "128 GB", category: "elektronik", sub: "cep-telefonu" },
    { name: "iPhone 15 256 GB", base: "iPhone 15", price: 59999, storage: "256 GB", category: "elektronik", sub: "cep-telefonu" },
    { name: "iPhone 15 512 GB", base: "iPhone 15", price: 69999, storage: "512 GB", category: "elektronik", sub: "cep-telefonu" },

    { name: "iPhone 15 Plus 128 GB", base: "iPhone 15 Plus", price: 61999, storage: "128 GB", category: "elektronik", sub: "cep-telefonu" },
    { name: "iPhone 15 Plus 256 GB", base: "iPhone 15 Plus", price: 66999, storage: "256 GB", category: "elektronik", sub: "cep-telefonu" },

    { name: "iPhone 15 Pro Max 256 GB", base: "iPhone 15 Pro Max", price: 89999, storage: "256 GB", category: "elektronik", sub: "cep-telefonu" },
    { name: "iPhone 15 Pro Max 512 GB", base: "iPhone 15 Pro Max", price: 99999, storage: "512 GB", category: "elektronik", sub: "cep-telefonu" },
    { name: "iPhone 15 Pro Max 1 TB", base: "iPhone 15 Pro Max", price: 115000, storage: "1 TB", category: "elektronik", sub: "cep-telefonu" },

    // --- SAMSUNG SERIES ---
    { name: "Samsung Galaxy S24 128 GB", base: "Samsung Galaxy S24", price: 39999, storage: "128 GB", category: "elektronik", sub: "cep-telefonu" },
    { name: "Samsung Galaxy S24 256 GB", base: "Samsung Galaxy S24", price: 42999, storage: "256 GB", category: "elektronik", sub: "cep-telefonu" },

    { name: "Samsung Galaxy S24 Ultra 256 GB", base: "Samsung Galaxy S24 Ultra", price: 69999, storage: "256 GB", category: "elektronik", sub: "cep-telefonu" },
    { name: "Samsung Galaxy S24 Ultra 512 GB", base: "Samsung Galaxy S24 Ultra", price: 75999, storage: "512 GB", category: "elektronik", sub: "cep-telefonu" },
    { name: "Samsung Galaxy S24 Ultra 1 TB", base: "Samsung Galaxy S24 Ultra", price: 89999, storage: "1 TB", category: "elektronik", sub: "cep-telefonu" },

    // --- IPHONE 13 (Still popular) ---
    { name: "iPhone 13 128 GB", base: "iPhone 13", price: 37999, storage: "128 GB", category: "elektronik", sub: "cep-telefonu" },
    { name: "iPhone 13 256 GB", base: "iPhone 13", price: 41999, storage: "256 GB", category: "elektronik", sub: "cep-telefonu" },

    // --- IPAD ---
    { name: "iPad Air 5.Nesil 64 GB", base: "iPad Air 5.Nesil", price: 21999, storage: "64 GB", category: "elektronik", sub: "tablet" },
    { name: "iPad Air 5.Nesil 256 GB", base: "iPad Air 5.Nesil", price: 27999, storage: "256 GB", category: "elektronik", sub: "tablet" },


    { name: "iPad Pro 11 M4 256 GB", base: "iPad Pro 11 M4", price: 39999, storage: "256 GB", category: "elektronik", sub: "tablet" },
    { name: "iPad Pro 11 M4 512 GB", base: "iPad Pro 11 M4", price: 47999, storage: "512 GB", category: "elektronik", sub: "tablet" },
];

async function run() {
    console.log("Seeding Database with Product Variants...");

    for (const p of products) {
        const slug = p.name.toLowerCase()
            .replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        // Attempt to find an existing image for the BASE model to reuse
        let imageUrl = "https://cdn.akakce.com/z/apple/iphone-15.jpg"; // Default fallback

        // Try to find a "master" product image if exists
        const { data: existing } = await supabase
            .from('products')
            .select('image')
            .ilike('name', `${p.base}%`)
            .neq('image', '')
            .limit(1)
            .maybeSingle();

        if (existing?.image) {
            imageUrl = existing.image;
        } else {
            // Simple mapping for demo if no DB image found
            if (p.base.includes("iPhone 15 Pro")) imageUrl = "https://cdn.akakce.com/z/apple/iphone-15-pro-128-gb.jpg";
            else if (p.base.includes("iPhone 15")) imageUrl = "https://cdn.akakce.com/z/apple/iphone-15.jpg";
            else if (p.base.includes("S24 Ultra")) imageUrl = "https://cdn.akakce.com/z/samsung/samsung-galaxy-s24-ultra.jpg";
            else if (p.base.includes("S24")) imageUrl = "https://cdn.akakce.com/z/samsung/samsung-galaxy-s24.jpg";
            else if (p.base.includes("iPhone 13")) imageUrl = "https://cdn.akakce.com/z/apple/iphone-13.jpg";
            else if (p.base.includes("iPad Air")) imageUrl = "https://cdn.akakce.com/z/apple/ipad-air-5-nesil-64-gb.jpg";
            else if (p.base.includes("iPad Pro")) imageUrl = "https://cdn.akakce.com/z/apple/ipad-pro-11-4-nesil.jpg";
        }

        const { error } = await supabase
            .from('products')
            .upsert({
                name: p.name,
                slug: slug,
                price: p.price,
                image: imageUrl,
                category: p.category,
                subcategory: p.sub,
                rating: 4.8,
                desc: `${p.name} - Detaylı fiyat karşılaştırması ve teknik özellikler.`,
                specs: {
                    storage: p.storage,
                    ram: "8 GB", // Generic for demo
                    name: p.name
                },
                store1_name: "PttAVM",
                store1_price: p.price,
                link: "https://www.pttavm.com",
                updated_at: new Date().toISOString()
            }, { onConflict: 'slug' });

        if (error) {
            console.error(`Error adding ${p.name}:`, error.message);
        } else {
            console.log(`Added/Updated: ${p.name}`);
        }
    }
    console.log("Seeding Complete.");
}

run();
