import { scrapeGsmArena } from './lib/scraper.js';
import { saveToSupabase } from './lib/supabase.js';

const PHONES_TO_SCRAPE = [
    { name: "iPhone 16 Pro Max", url: "https://www.gsmarena.com/apple_iphone_16_pro_max-13312.php" },
    { name: "iPhone 15 Pro Max", url: "https://www.gsmarena.com/apple_iphone_15_pro_max-12548.php" },
    { name: "Samsung Galaxy S24 Ultra", url: "https://www.gsmarena.com/samsung_galaxy_s24_ultra-12771.php" },
    { name: "Samsung Galaxy S23 Ultra", url: "https://www.gsmarena.com/samsung_galaxy_s23_ultra-12024.php" },
    { name: "Xiaomi 14 Ultra", url: "https://www.gsmarena.com/xiaomi_14_ultra-12827.php" },

    // Tabletler
    { name: "iPad Pro 13 (2024)", url: "https://www.gsmarena.com/apple_ipad_pro_13_(2024)-12988.php" },
    { name: "Samsung Galaxy Tab S9 Ultra", url: "https://www.gsmarena.com/samsung_galaxy_tab_s9_ultra-12439.php" },

    // Akıllı Saatler
    { name: "Apple Watch Ultra 2", url: "https://www.gsmarena.com/apple_watch_ultra_2-12546.php" },
    { name: "Samsung Galaxy Watch6 Classic", url: "https://www.gsmarena.com/samsung_galaxy_watch6_classic-12432.php" }
];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
    console.log(`🚀 GSM Arena üzerinden ${PHONES_TO_SCRAPE.length} telefon taranacak...`);

    for (const [index, phone] of PHONES_TO_SCRAPE.entries()) {
        console.log(`\n[${index + 1}/${PHONES_TO_SCRAPE.length}] İşleniyor: ${phone.name}`);

        try {
            const data = await scrapeGsmArena(phone.url);

            // Eğer scraper isim bulamazsa bizim listemizdekini kullansın
            if (!data.name) data.name = phone.name;

            await saveToSupabase(data);
            console.log(`✅ Kaydedildi: ${data.name} (Görseller: ${data.images?.length || 0} adet)`);

        } catch (err) {
            console.error(`❌ Hata (${phone.name}):`, err.message);
        }

        // GSM Arena'yı kızdırmamak için bekleme süresi
        await delay(3000);
    }

    console.log('\n✨ Tüm işlemler tamamlandı!');
})();
