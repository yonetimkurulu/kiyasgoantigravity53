import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://eupwqhesbcjczsdgkurh.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cHdxaGVzYmNqY3pzZGdrdXJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDgzNzc3NiwiZXhwIjoyMDgwNDEzNzc2fQ.iuyn8M3WvaFhHjXKkqLNRMsjoVARuvy22TIaAM1YJ80";
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const newProducts = [
    { name: "NVIDIA GeForce RTX 5090", price: 75000 },
    { name: "NVIDIA GeForce RTX 5080", price: 55000 },
    { name: "NVIDIA GeForce RTX 5070", price: 35000 },
    { name: "NVIDIA GeForce RTX 5060", price: 20000 },
    { name: "Intel Arc B580", price: 12000 },
    { name: "Intel Arc A750", price: 9000 },
    { name: "AMD Radeon RX 7700 XT", price: 18000 },
    { name: "AMD Radeon RX 9060 XT", price: 25000 },
    { name: "AMD Radeon RX 9070 XT", price: 40000 },
];

async function addProducts() {
    console.log("Adding new GPUs to Supabase...");

    const productsToInsert = newProducts.map(p => ({
        name: p.name,
        slug: p.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, ''),
        category: 'elektronik',
        subcategory: 'ekran-karti',
        price: p.price,
        desc: 'Yeni nesil yüksek performanslı ekran kartı.',
        rating: 5.0,
        image: '' // User will upload
    }));

    const { data, error } = await supabase
        .from('products')
        .upsert(productsToInsert, { onConflict: 'name' })
        .select();

    if (error) {
        console.error("Error inserting products:", error);
    } else {
        console.log(`Successfully added ${data.length} products!`);
        data.forEach(p => console.log(`- ${p.name}`));
    }
}

addProducts();
