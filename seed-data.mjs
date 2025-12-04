
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURATION ---
const SUPABASE_URL = "https://eupwqhesbcjczsdgkurh.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cHdxaGVzYmNqY3pzZGdrdXJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDgzNzc3NiwiZXhwIjoyMDgwNDEzNzc2fQ.iuyn8M3WvaFhHjXKkqLNRMsjoVARuvy22TIaAM1YJ80";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const MANUAL_DATA = [
    {
        name: "iPhone 17 Pro",
        url: "https://www.gsmarena.com/apple_iphone_17_pro-14049.php",
        image: "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro.jpg", // Placeholder until official
        display: "6.3 inches, LTPO Super Retina XDR OLED, 120Hz",
        storage: ["256GB", "512GB", "1TB"],
        ram: ["12GB"],
        camera: "Main: 48 MP, f/1.8 | Selfie: 24 MP, f/1.9",
        battery: "Li-Ion 3500 mAh, non-removable",
        networks: ["5G", "4G", "LTE", "Wi-Fi 7"],
        price: "$1099"
    },
    {
        name: "iPhone 16 Pro",
        url: "https://www.gsmarena.com/apple_iphone_16_pro-13106.php",
        image: "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro.jpg",
        display: "6.3 inches, LTPO Super Retina XDR OLED, 120Hz",
        storage: ["256GB", "512GB", "1TB"],
        ram: ["8GB"],
        camera: "Main: 48 MP, f/1.8 | Selfie: 12 MP, f/1.9",
        battery: "Li-Ion 3355 mAh, non-removable",
        networks: ["5G", "4G", "LTE", "Wi-Fi 7"],
        price: "$999"
    },
    {
        name: "Samsung S25 Ultra",
        url: "https://www.gsmarena.com/samsung_galaxy_s25_ultra-12822.php",
        image: "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-ultra-5g-sm-s928.jpg", // Placeholder
        display: "6.9 inches, Dynamic LTPO AMOLED 2X, 120Hz",
        storage: ["256GB", "512GB", "1TB"],
        ram: ["12GB", "16GB"],
        camera: "Main: 200 MP, f/1.7 | Selfie: 12 MP, f/2.2",
        battery: "Li-Ion 5000 mAh, non-removable, 45W wired",
        networks: ["5G", "4G", "LTE", "Wi-Fi 7"],
        price: "$1299"
    },
    {
        name: "iPhone 15 Pro",
        url: "https://www.gsmarena.com/apple_iphone_15_pro-12548.php",
        image: "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-pro.jpg",
        display: "6.1 inches, LTPO Super Retina XDR OLED, 120Hz",
        storage: ["128GB", "256GB", "512GB", "1TB"],
        ram: ["8GB"],
        camera: "Main: 48 MP, f/1.8 | Selfie: 12 MP, f/1.9",
        battery: "Li-Ion 3274 mAh, non-removable",
        networks: ["5G", "4G", "LTE"],
        price: "$999"
    },
    {
        name: "Samsung Galaxy S23 FE",
        url: "https://www.gsmarena.com/samsung_galaxy_s23_fe-12502.php",
        image: "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s23-fe.jpg",
        display: "6.4 inches, Dynamic AMOLED 2X, 120Hz",
        storage: ["128GB", "256GB"],
        ram: ["8GB"],
        camera: "Main: 50 MP, f/1.8 | Selfie: 10 MP, f/2.4",
        battery: "Li-Ion 4500 mAh, non-removable",
        networks: ["5G", "4G", "LTE"],
        price: "$599"
    }
];

(async () => {
    console.log(`🚀 Manuel veri girişi başlatılıyor (${MANUAL_DATA.length} ürün)...`);

    for (const phone of MANUAL_DATA) {
        const { error } = await supabase.from('phones').upsert(phone, { onConflict: 'url' });

        if (error) {
            console.error(`❌ Hata (${phone.name}):`, error.message);
        } else {
            console.log(`✅ Kaydedildi: ${phone.name}`);
        }
    }

    console.log('\n✨ Veritabanı güncellendi!');
})();
