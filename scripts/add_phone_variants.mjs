
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://eupwqhesbcjczsdgkurh.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cHdxaGVzYmNqY3pzZGdrdXJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDgzNzc3NiwiZXhwIjoyMDgwNDEzNzc2fQ.iuyn8M3WvaFhHjXKkqLNRMsjoVARuvy22TIaAM1YJ80";
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const variants = [
    {
        name: "Iphone 15 Pro 128 GB",
        slug: "iphone-15-pro-128-gb",
        price: 77658,
        image: "https://cdn.akakce.com/z/apple/iphone-15-pro-128-gb.jpg",
        storage: "128 GB"
    },
    {
        name: "Iphone 15 Pro 256 GB",
        slug: "iphone-15-pro-256-gb",
        price: 84999,
        image: "https://cdn.akakce.com/z/apple/iphone-15-pro-128-gb.jpg", // Same image
        storage: "256 GB"
    },
    {
        name: "Iphone 15 Pro 512 GB",
        slug: "iphone-15-pro-512-gb",
        price: 92500,
        image: "https://cdn.akakce.com/z/apple/iphone-15-pro-128-gb.jpg", // Same image
        storage: "512 GB"
    },
    {
        name: "Iphone 15 Pro 1 TB",
        slug: "iphone-15-pro-1-tb",
        price: 105000,
        image: "https://cdn.akakce.com/z/apple/iphone-15-pro-128-gb.jpg", // Same image
        storage: "1 TB"
    }
];

async function run() {
    console.log("Adding iPhone 15 Pro variants...");

    for (const v of variants) {
        const { data, error } = await supabase
            .from('products')
            .upsert({
                name: v.name,
                slug: v.slug,
                price: v.price,
                image: v.image,
                category: 'elektronik',
                subcategory: 'cep-telefonu',
                rating: 4.8,
                desc: `Apple ${v.name} akıllı telefon.`,
                specs: {
                    storage: v.storage,
                    ram: "8 GB",
                    display: "6.1 inç OLED",
                    battery: "3274 mAh",
                    name: v.name
                },
                store1_name: "PttAVM",
                store1_price: v.price,
                link: "https://www.pttavm.com",
                updated_at: new Date().toISOString()
            }, { onConflict: 'slug' });

        if (error) {
            console.error(`Error adding ${v.name}:`, error);
        } else {
            console.log(`Added: ${v.name}`);
        }
    }

    // Also add a Samsung Tablet example for variety
    const tabletVariants = [
        {
            name: "Samsung Galaxy Tab S9 128 GB",
            slug: "samsung-galaxy-tab-s9-128-gb",
            price: 24000,
            image: "https://cdn.akakce.com/z/samsung/samsung-galaxy-tab-s9.jpg",
            storage: "128 GB"
        },
        {
            name: "Samsung Galaxy Tab S9 256 GB",
            slug: "samsung-galaxy-tab-s9-256-gb",
            price: 27500,
            image: "https://cdn.akakce.com/z/samsung/samsung-galaxy-tab-s9.jpg",
            storage: "256 GB"
        }
    ];

    for (const v of tabletVariants) {
        const { data, error } = await supabase
            .from('products')
            .upsert({
                name: v.name,
                slug: v.slug,
                price: v.price,
                image: v.image,
                category: 'elektronik',
                subcategory: 'tablet',
                rating: 4.7,
                desc: `Samsung ${v.name} tablet.`,
                specs: {
                    storage: v.storage,
                    ram: "8 GB",
                    display: "11 inç AMOLED",
                    battery: "8400 mAh",
                    name: v.name
                },
                store1_name: "Amazon",
                store1_price: v.price,
                link: "https://www.amazon.com.tr",
                updated_at: new Date().toISOString()
            }, { onConflict: 'slug' });

        if (error) {
            console.error(`Error adding ${v.name}:`, error);
        } else {
            console.log(`Added: ${v.name}`);
        }
    }

    console.log("Done.");
}

run();
