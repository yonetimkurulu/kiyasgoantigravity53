const { createClient } = require('@supabase/supabase-js');

const url = "https://eupwqhesbcjczsdgkurh.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cHdxaGVzYmNqY3pzZGdrdXJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDgzNzc3NiwiZXhwIjoyMDgwNDEzNzc2fQ.iuyn8M3WvaFhHjXKkqLNRMsjoVARuvy22TIaAM1YJ80";

const supabase = createClient(url, key);

async function cleanAllDesc() {
    console.log("Fetching potentially messy products...");

    // Broader search: Any desc with "Özellikleri" OR very long descs
    // fetching all recently added items might be better but let's stick to content check
    const { data: products, error } = await supabase
        .from('products')
        .select('id, name, desc')
        .ilike('desc', '%zellikleri%') // Matches "Özellikleri" broadly
        .limit(500);

    if (error) { console.error(error); return; }

    console.log(`Found ${products.length} products potentially needing cleanup.`);

    let count = 0;
    for (const p of products) {
        let newDesc = "Güncel Teknoloji, Yüksek Performans, Şık Tasarım";
        const nameUpper = p.name.toUpperCase();

        // Skip if it doesn't actually look like the scrape dump
        // The dump format typically has "Name Özellikleri"
        if (!p.desc.includes('zellikleri') && p.desc.length < 100) {
            continue;
        }

        // 1. IPHONES
        if (nameUpper.includes("IPHONE 17")) {
            if (nameUpper.includes("PRO") || nameUpper.includes("MAX")) {
                newDesc = "A19 Pro Çip, 48MP Pro Kamera Sistemi, Titanyum Tasarım";
            } else {
                newDesc = "A19 Çip, Gelişmiş Çift Kamera, Tüm Gün Pil Ömrü";
            }
        }
        // 2. XIAOMI
        else if (nameUpper.includes("XIAOMI 15") || nameUpper.includes("XIAOMI 14") || nameUpper.includes("15T")) {
            if (nameUpper.includes("ULTRA")) {
                newDesc = "Leica Dörtlü Kamera, Snapdragon 8 Gen 3/4, 2K Ekran";
            } else if (nameUpper.includes("PRO")) {
                newDesc = "Leica Optik, 120Hz AMOLED Ekran, 120W Hızlı Şarj";
            } else {
                newDesc = "Leica Lens, Kompakt Amiral Gemisi, Snapdragon İşlemci";
            }
        }
        else if (nameUpper.includes("REDMI NOTE 13")) {
            newDesc = "200 MP Kamera, 120Hz Ekran, Fiyat/Performans Kralı";
        }
        else if (nameUpper.includes("POCO")) {
            newDesc = "Yüksek Performans, Oyuncu Odaklı, Hızlı Şarj";
        }
        // 3. SAMSUNG
        else if (nameUpper.includes("GALAXY S25")) {
            if (nameUpper.includes("ULTRA")) newDesc = "Snapdragon 8 Elite, 200 MP Kamera, Titanyum Gövde, S-Pen";
            else newDesc = "Snapdragon 8 Elite, 50 MP Kamera, Kompakt Amiral Gemisi";
        }
        else if (nameUpper.includes("GALAXY S24")) {
            newDesc = "Yapay Zeka Özellikleri, Üstün Kamera, Premium Tasarım";
        }
        else if (nameUpper.includes("GALAXY A")) {
            newDesc = "Geniş Süper AMOLED Ekran, Uzun Pil Ömrü, Şık Tasarım";
        }
        else if (nameUpper.includes("GALAXY M")) {
            newDesc = "Devasa Batarya, Büyük Ekran, Güçlü Performans";
        }
        // MONSTER / LAPTOPS
        else if (nameUpper.includes("MONSTER") || nameUpper.includes("TULPAR")) {
            newDesc = "Yüksek Performanslı Oyun Bilgisayarı, RTX Ekran Kartı, Hızlı Ekran";
        }
        else {
            // Fallback for others
            // Use generic text
            newDesc = "Yüksek Performans, Şık Tasarım, Güncel Teknoloji";
        }

        if (p.desc !== newDesc) {
            console.log(`Cleaning ${p.name}...`);
            await supabase.from('products').update({ desc: newDesc }).eq('id', p.id);
            count++;
        }
    }

    console.log(`Cleanup complete! Updated ${count} products.`);
}

cleanAllDesc();
