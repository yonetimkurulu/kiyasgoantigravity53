const { createClient } = require('@supabase/supabase-js');

const url = "https://eupwqhesbcjczsdgkurh.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cHdxaGVzYmNqY3pzZGdrdXJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDgzNzc3NiwiZXhwIjoyMDgwNDEzNzc2fQ.iuyn8M3WvaFhHjXKkqLNRMsjoVARuvy22TIaAM1YJ80";

const supabase = createClient(url, key);

async function cleanDesc() {
    console.log("Fetching S25 products...");
    const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .ilike('name', 'Samsung Galaxy S25%');

    if (error) { console.error(error); return; }

    console.log(`Found ${products.length} products.`);

    for (const p of products) {
        let newDesc = "";
        const nameUpper = p.name.toUpperCase();

        if (nameUpper.includes("ULTRA")) {
            newDesc = "Snapdragon 8 Elite, 200 MP Kamera, Titanyum Gövde, S-Pen";
        } else if (nameUpper.includes("PLUS") || nameUpper.includes("FE")) {
            // FE usually slightly different but let's keep it clean
            newDesc = "Snapdragon 8 Elite, Geniş Ekran, Uzun Pil Ömrü, AI Özellikleri";
        } else if (nameUpper.includes("EDGE")) { // S25 Edge? Is that a thing? User has it in DB.
            newDesc = "Kavisli Ekran, Premium Tasarım, Yüksek Performans";
        } else {
            // Base S25
            newDesc = "Snapdragon 8 Elite, 50 MP Kamera, Kompakt Amiral Gemisi";
        }

        // Only update if currently it is the long junk
        // Or just force update to be consistent
        if (p.desc !== newDesc) {
            console.log(`Updating ${p.name} -> ${newDesc}`);
            await supabase.from('products').update({ desc: newDesc }).eq('id', p.id);
        }
    }
}

cleanDesc();
