
import { createClient } from '@supabase/supabase-js';

// --- AYARLAR ---
const SUPABASE_URL = "https://eupwqhesbcjczsdgkurh.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cHdxaGVzYmNqY3pzZGdrdXJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDgzNzc3NiwiZXhwIjoyMDgwNDEzNzc2fQ.iuyn8M3WvaFhHjXKkqLNRMsjoVARuvy22TIaAM1YJ80";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// ---------------------------------------------------------
// 👇👇 ÜRÜN BİLGİLERİNİ BURAYA GİR (Her seferinde değiştir) 👇👇
// ---------------------------------------------------------

const URUN = {
    isim: "iPhone 16 Pro Max",
    slug: "iphone-16-pro-max", // URL'de görünecek isim (boşluksuz, küçük harf)

    // EN UCUZ FİYAT (Ana Fiyat)
    fiyat: 99000,
    link: "https://trendyol.com/iphone-16-pro-max...",

    // RESİMLER (1. Resim 'image' sütununa gider)
    resim1: "https://cdn.epey.com/resim/1.jpg",
    resim2: "https://cdn.epey.com/resim/2.jpg",
    resim3: "https://cdn.epey.com/resim/3.jpg",
    resim4: "https://cdn.epey.com/resim/4.jpg",
    resim5: "https://cdn.epey.com/resim/5.jpg",

    // DİĞER MAĞAZA FİYATLARI
    magaza2: "Hepsiburada",
    fiyat2: 105000,
    link2: "https://hepsiburada.com/...",

    magaza3: "Amazon",
    fiyat3: 99500,
    link3: "https://amazon.com.tr/...",

    magaza4: "N11",
    fiyat4: 102000,
    link4: "https://n11.com/...",

    magaza5: "MediaMarkt",
    fiyat5: 108000,
    link5: "https://mediamarkt.com.tr/..."
};

// ---------------------------------------------------------

async function kaydet() {
    console.log(`📤 Yükleniyor: ${URUN.isim}...`);

    // Veritabanı sütunlarına eşleştirme
    const veriler = {
        name: URUN.isim,
        slug: URUN.slug || URUN.isim.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, ''),
        price: URUN.fiyat,
        link: URUN.link,

        image: URUN.resim1, // ARTIK IMAGE1 YOK, IMAGE VAR
        image2: URUN.resim2,
        image3: URUN.resim3,
        image4: URUN.resim4,
        image5: URUN.resim5,

        store2_name: URUN.magaza2,
        store2_price: URUN.fiyat2,
        store2_link: URUN.link2,

        store3_name: URUN.magaza3,
        store3_price: URUN.fiyat3,
        store3_link: URUN.link3,

        store4_name: URUN.magaza4,
        store4_price: URUN.fiyat4,
        store4_link: URUN.link4,

        store5_name: URUN.magaza5,
        store5_price: URUN.fiyat5,
        store5_link: URUN.link5,

        updated_at: new Date().toISOString()
    };

    const { error } = await supabase.from('products').upsert(veriler, { onConflict: 'name' });

    if (error) {
        console.error("❌ Hata:", error.message);
        console.log("⚠️ Eğer 'column not found' hatası alıyorsan, Supabase'de tablo sütunlarını açman gerekir.");
    } else {
        console.log("✅ Başarıyla Kaydedildi!");
    }
}

kaydet();
