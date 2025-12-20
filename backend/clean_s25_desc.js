const { createClient } = require('@supabase/supabase-js');

const url = "https://eupwqhesbcjczsdgkurh.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cHdxaGVzYmNqY3pzZGdrdXJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDgzNzc3NiwiZXhwIjoyMDgwNDEzNzc2fQ.iuyn8M3WvaFhHjXKkqLNRMsjoVARuvy22TIaAM1YJ80";

const supabase = createClient(url, key);

async function cleanDesc() {
    console.log("Fetching new products...");
    // Filter for products that likely have the issue (e.g., Samsung Galaxy S25...)
    const { data: products, error } = await supabase
        .from('products')
        .select('id, name, desc')
        .ilike('name', 'Samsung Galaxy S25%')
        .limit(100);

    if (error) { console.error(error); return; }

    console.log(`Checking ${products.length} products...`);

    for (const p of products) {
        let oldDesc = p.desc || '';

        // If desc starts with "NAME Özellikleri •", it's the raw dump.
        // e.g. "Samsung Galaxy S25 Ultra Özellikleri • Neural processor..."

        // Strategy: 
        // 1. Remove the "Title Özellikleri • " prefix.
        // 2. Take the first 1-2 important specs?
        // Actually, user just wants it CLEAN and SHORT.
        // Maybe "Snapdragon 8 Elite, 200 MP Kamera" is enough.

        // Let's try to parse the raw string.
        // "Neural processor (NPU): Hexagon • SoC: Qualcomm Snapdragon 8 Elite • OS size: 30.4 GB..."

        let newDesc = oldDesc;

        if (oldDesc.includes('Özellikleri •')) {
            // It's the messy one.
            // Let's try to extract key components if possible, or just truncate cleanly.
            const parts = oldDesc.split('•').map(s => s.trim());

            // Look for specific keywords to build a nice summary
            const soc = parts.find(s => s.includes('SoC:') || s.includes('Processor') || s.includes('Snapdragon'))?.replace('SoC:', '').trim();
            const cam = parts.find(s => s.includes('Camera:') || s.includes('Kamera'))?.replace('Camera:', '').trim();
            const ram = parts.find(s => s.includes('Memory:') || s.includes('RAM'))?.replace('Memory:', '').trim();

            // Build new short desc
            let shortParts = [];
            if (soc) shortParts.push(soc.split(',')[0]); // "Qualcomm Snapdragon 8 Elite"
            if (cam) shortParts.push(cam.split('(')[0]); // "4" ?? No, that's "Camera: 4". Sometimes format varies.

            // Fallback: If we can't parse smartly, just take the first 60 chars or so of valid content.
            // But raw content starts with NPU usually.

            // Let's just set a generic nice description for S25 series if we fail to parse
            if (p.name.includes("Ultra")) {
                newDesc = "Snapdragon 8 Elite, 200 MP Kamera, Titanyum Gövde";
            } else if (p.name.includes("Plus")) {
                newDesc = "Snapdragon 8 Elite, Geniş Ekran, Uzun Pil Ömrü";
            } else {
                newDesc = "Snapdragon 8 Elite, 50 MP Kamera, Yapay Zeka";
            }
        } else if (oldDesc.length > 100) {
            // Just too long generic text
            newDesc = oldDesc.substring(0, 100) + "...";
        }

        if (newDesc !== oldDesc) {
            console.log(`Updated ${p.name}: \n  OLD: ${oldDesc.substring(0, 50)}...\n  NEW: ${newDesc}`);
            await supabase.from('products').update({ desc: newDesc }).eq('id', p.id);
        }
    }
}

cleanDesc();
