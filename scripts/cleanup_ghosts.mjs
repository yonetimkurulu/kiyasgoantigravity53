
import { createClient } from '@supabase/supabase-js';

// --- AYARLAR ---
const SUPABASE_URL = "https://eupwqhesbcjczsdgkurh.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cHdxaGVzYmNqY3pzZGdrdXJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDgzNzc3NiwiZXhwIjoyMDgwNDEzNzc2fQ.iuyn8M3WvaFhHjXKkqLNRMsjoVARuvy22TIaAM1YJ80";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function cleanupGhosts() {
    console.log("👻 Hayalet Avcıları İş Başında...");

    // 1. Delete where slug is NULL
    const { error: nullError, count: nullCount } = await supabase
        .from('products')
        .delete({ count: 'exact' })
        .is('slug', null);

    if (nullError) {
        console.error("Null Slug Silme Hatası:", nullError.message);
    } else {
        console.log(`✅ Slug'ı olmayan ${nullCount} adet hayalet ürün silindi.`);
    }

    // 2. Delete where name is short/invalid (optional safety net)
    // But since we synced all valid ones with slugs, any REMAINING slugless ones are gone.
    // What if there are ghosts WITH slugs but wrong names?
    // Our sync script removed anything not in duplicate list?
    // Let's re-verify counts.

    const { count: finalCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

    console.log(`🧹 Temizlik Sonrası Toplam Ürün Sayısı: ${finalCount}`);

    if (finalCount > 104) {
        console.log("⚠️ Hala fazlalık var gibi. Manuel kontrol gerekebilir.");
    } else if (finalCount === 104) {
        console.log("🎉 Mükemmel! Tam 104 ürün kaldı.");
    } else {
        console.log(`ℹ️ ${finalCount} ürün var. (104 olmalıydı, belki bazıları silindi?)`);
    }
}

cleanupGhosts();
