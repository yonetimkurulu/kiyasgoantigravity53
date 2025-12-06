
import { createClient } from '@supabase/supabase-js';

// --- AYARLAR ---
const SUPABASE_URL = "https://eupwqhesbcjczsdgkurh.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cHdxaGVzYmNqY3pzZGdrdXJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDgzNzc3NiwiZXhwIjoyMDgwNDEzNzc2fQ.iuyn8M3WvaFhHjXKkqLNRMsjoVARuvy22TIaAM1YJ80";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// Import Local Data manually to avoid file read issues
const LOCAL_NAMES = [
    "Apple iPhone 15 Pro", "Samsung Galaxy S24 Ultra", "Apple iPhone 15", "Samsung Galaxy S24+",
    "Xiaomi 14 Pro", "Samsung Galaxy A55 5G", "Apple iPhone 14", "Samsung Galaxy Z Fold5",
    "Xiaomi Redmi Note 13 Pro+ 5G", "OPPO Reno11 Pro 5G", "Samsung Galaxy S23 FE", "Apple iPhone 13",
    "Xiaomi Poco X6 Pro 5G", "Samsung Galaxy A35 5G", "Apple iPhone SE (3. Nesil)", "vivo V30 Pro",
    "Samsung Galaxy Z Flip5", "Xiaomi 13T Pro", "OPPO A78 5G", "Samsung Galaxy M55 5G",
    "Samsung 65\" QLED 4K QN90C Smart TV", "LG 55\" OLED 4K evo C3 Smart TV", "Vestel 65\" 4K UHD Smart TV 65U9500",
    "Philips 55\" OLED+ 4K 808 Smart TV", "Samsung 55\" Crystal 4K AU8000 Smart TV", "LG 75\" NanoCell 4K 75NANO76SRA Smart TV",
    "Arçelik 55\" OLED Pro Smart TV", "Xiaomi Mi TV P1 55\" 4K Android TV", "Toshiba 55\" 4K UHD Smart TV 55V35KE",
    "Sony 65\" Bravia XR X90L 4K Smart TV", "Samsung Galaxy Tab S9 Ultra", "Apple iPad Pro 12.9\" (M2)",
    "Samsung Galaxy Tab S9+", "Apple iPad Air 5", "Lenovo Tab P12 Pro", "Huawei MatePad Pro 13.2\"",
    "Apple iPad 10. Nesil", "Samsung Galaxy Tab A9+", "Xiaomi Pad 6", "Amazon Fire HD 10",
    "Apple MacBook Air M2 13.6 inç", "Lenovo IdeaPad Gaming 3 15.6 inç", "HP Pavilion 15-eg2007nt 15.6 inç",
    "ASUS ROG Strix G15 G513RC-HN077 15.6 inç", "Acer Nitro 5 AN515-58 15.6 inç", "Dell Inspiron 15 3520 15.6 inç",
    "MSI Katana GF66 12UC-621XTR 15.6 inç", "Apple MacBook Pro 14 inç M3", "ASUS Vivobook Pro 15 OLED K6502ZC-MA043W 15.6 inç",
    "Lenovo ThinkPad E15 Gen 4 15.6 inç", "Bosch Serie 4 WTW875W1TR A+++ 9 kg Kurutma Makinesi",
    "Samsung DV90TA040AE/TK Heat Pump 9 kg Kurutma Makinesi", "Arçelik 9143 YKM A+++ 9 kg Kurutma Makinesi",
    "Profilo CD93P3TR A+++ 9 kg Kurutma Makinesi", "Vestel KM 9101 A+++ 9 kg Kurutma Makinesi",
    "LG RC90V9AV2W Heat Pump 9 kg Kurutma Makinesi", "Altus AL 9101 A A+++ 9 kg Kurutma Makinesi",
    "Grundig GTN 99220 A+++ 9 kg Kurutma Makinesi", "Beko D 8101 A A+++ 8 kg Kurutma Makinesi",
    "Siemens WT47WH0TR iQ500 A+++ 9 kg Kurutma Makinesi", "AirPods Pro 2. Nesil", "Sony WH-1000XM5",
    "Samsung Galaxy Buds2 Pro", "MSI Raider GE78", "Monster Tulpar T7", "Samsung Odyssey G9 OLED",
    "LG UltraGear 27GR95QE", "Dyson Gen5detect", "Roborock S8 Pro Ultra", "MSI GeForce RTX 4090",
    "Apple Watch Ultra 2", "Samsung Galaxy Watch 6 Classic", "Nike Air Max", "Zara Blazer Ceket",
    "Philips Airfryer XXL"
];

async function checkMismatches() {
    console.log("🔍 Uyuşmazlıklar Taranıyor...");
    // Fetch Name and Slug only
    const { data: remoteData, error } = await supabase.from('products').select('name, slug, id');
    if (error) { console.error(error); return; }

    let ghostCount = 0;

    // Check which Removed Products don't match Local Products
    remoteData.forEach(remote => {
        const exactMatch = LOCAL_NAMES.includes(remote.name);
        // Also check simplified match to simulate Client logic
        const fuzzyMatch = LOCAL_NAMES.some(localName =>
            localName.toLowerCase().trim() === remote.name.toLowerCase().trim()
        );

        if (!exactMatch && !fuzzyMatch) {
            console.log(`👻 GHOST (Sitede Fazladan Görünür): "${remote.name}" (Slug: ${remote.slug})`);
            ghostCount++;
        }
    });

    console.log(`\nToplam Hayalet Ürün Sayısı: ${ghostCount}`);

    if (ghostCount > 0) {
        console.log("Bu 'Hayalet' ürünler, mergedProducts mantığıyla 'Yeni Ürün' sanılıp listeye ekleniyor. Bunları silmeliyiz.");
    }
}

checkMismatches();
