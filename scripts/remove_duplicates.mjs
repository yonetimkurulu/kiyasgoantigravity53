
import { createClient } from '@supabase/supabase-js';

// --- AYARLAR ---
const SUPABASE_URL = "https://eupwqhesbcjczsdgkurh.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cHdxaGVzYmNqY3pzZGdrdXJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDgzNzc3NiwiZXhwIjoyMDgwNDEzNzc2fQ.iuyn8M3WvaFhHjXKkqLNRMsjoVARuvy22TIaAM1YJ80";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function removeDuplicates() {
    console.log("🔍 Çift Ürünler Taranıyor...");

    const { data: products, error } = await supabase
        .from('products')
        .select('id, name, slug');
    //.order('id', { ascending: true }); // ID'ye göre sırala (isteğe bağlı)

    if (error) {
        console.error("Hata:", error.message);
        return;
    }

    const seenNames = new Set();
    const duplicates = [];

    // İsim bazlı kontrol
    for (const product of products) {
        // İsmi normalize et (boşlukları trimle, küçük harfe çevir)
        const normalizedName = product.name.trim().toLowerCase();

        if (seenNames.has(normalizedName)) {
            duplicates.push(product);
        } else {
            seenNames.add(normalizedName);
        }
    }

    console.log(`Toplam Ürün Sayısı: ${products.length}`);
    console.log(`Silinecek Kopya Sayısı: ${duplicates.length}`);

    if (duplicates.length > 0) {
        console.log("🗑️ Silme işlemi başlıyor...");
        for (const dup of duplicates) {
            const { error: delError } = await supabase
                .from('products')
                .delete()
                .eq('id', dup.id);

            if (delError) {
                console.log(`❌ Silinemedi (${dup.name}): ${delError.message}`);
            } else {
                console.log(`✅ Silindi: ${dup.name} (ID: ${dup.id})`);
            }
        }
        console.log("🎉 Temizlik Tamamlandı!");
    } else {
        console.log("✅ Kopya ürün bulunamadı. Veritabanı temiz.");
    }
}

removeDuplicates();
