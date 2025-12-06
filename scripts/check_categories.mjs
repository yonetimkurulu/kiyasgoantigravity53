
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://eupwqhesbcjczsdgkurh.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cHdxaGVzYmNqY3pzZGdrdXJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDgzNzc3NiwiZXhwIjoyMDgwNDEzNzc2fQ.iuyn8M3WvaFhHjXKkqLNRMsjoVARuvy22TIaAM1YJ80";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function checkCategories() {
    console.log("📊 Kategori Raporu Hazırlanıyor...");

    const { data: products, error } = await supabase.from('products').select('name, category, subcategory');

    if (error) { console.error(error); return; }

    const report = {
        total: products.length,
        missingCategory: 0,
        missingSubcategory: 0,
        categories: {},
        subcategories: {}
    };

    products.forEach(p => {
        // Count Missing
        if (!p.category) report.missingCategory++;
        if (!p.subcategory) report.missingSubcategory++;

        // Tally Categories
        const cat = p.category || 'NULL';
        report.categories[cat] = (report.categories[cat] || 0) + 1;

        // Tally Subcategories
        const sub = p.subcategory || 'NULL';
        report.subcategories[sub] = (report.subcategories[sub] || 0) + 1;
    });

    console.log("--- ÖZET ---");
    console.log(`Toplam Ürün: ${report.total}`);
    console.log(`Kategorisi Olmayan: ${report.missingCategory}`);
    console.log(`Alt Kategorisi Olmayan: ${report.missingSubcategory}`);

    console.log("\n--- KATEGORİ DAĞILIMI ---");
    console.table(report.categories);

    console.log("\n--- ALT KATEGORİ DAĞILIMI ---");
    console.table(report.subcategories);

    if (report.missingCategory > 0 || report.missingSubcategory > 0) {
        console.log("\n⚠️ Eksik kategoriler var! Bunlar sitede listelenmez.");
        console.log("Düzeltmek için sync_products.mjs scriptini tekrar çalıştırabiliriz.");
    }
}

checkCategories();
