
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://eupwqhesbcjczsdgkurh.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cHdxaGVzYmNqY3pzZGdrdXJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDgzNzc3NiwiZXhwIjoyMDgwNDEzNzc2fQ.iuyn8M3WvaFhHjXKkqLNRMsjoVARuvy22TIaAM1YJ80";
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// Copy-paste the exact logic from ProductDetailView.js
const colorPattern = /(Siyah|Beyaz|Mavi|Kırmızı|Yeşil|Sarı|Mor|Gri|Gümüş|Altın|Pembe|Turuncu|Lacivert|Krem|Bej|Bordo|Black|White|Blue|Red|Green|Yellow|Purple|Grey|Silver|Gold|Pink|Orange|Navy|Cream|Beige|Midnight|Starlight|Graphite|Space|Titanium|Natural|Sierra|Alpine|Deep|Jet|Mat|Parlak|Rose|Dark|Light|Titanyum|Gece|Yıldız|Uzay|Menekşe|Okyanus|Kehribar|Bakır|Zümrüt|Safir|Işığı|Yarısı)/gi;

const getBaseName = (name) => {
    if (!name || typeof name !== 'string') return "";
    return name
        .toLowerCase()
        .replace(/^(apple|samsung|xiaomi|huawei|oppo|vivo|realme|oneplus|general mobile|reeder|casper|honor|poco|tecno|infinix|google|asus|sony|vestel|omix|monster|lenovo|hp|acer|dell|msi|dyosn|philips|roborock|vestel|profilo|arçelik|beko|bosch|siemens|lg|sony)\s+/gi, '')
        .replace(/\s(16|32|64|128|256|512)\s?gb|1\s?tb/gi, '')
        .replace(/\s\d{1,2}\s?gb\s?ram/gi, '')
        .replace(colorPattern, '')
        .replace(/[\(\)\[\]]/g, ' ') // Replace parens with space
        .replace(/(\s|^)(5g|4g|lte)(\s|$)/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
};

async function checkTablets() {
    console.log("Fetching iPads...");

    // Search for iPad Pro 12.9 products
    const { data: products, error } = await supabase
        .from('products')
        .select('name, slug')
        .ilike('name', '%iPad Pro 12.9%')
        .limit(20);

    if (error) {
        console.error("Error:", error);
        return;
    }

    console.log(`Found ${products.length} products.\n`);

    products.forEach(p => {
        const base = getBaseName(p.name);
        console.log(`Original: "${p.name}"`);
        console.log(`BaseName: "${base}"`);
        console.log('---');
    });

    // Pick one and try to match variants
    if (products.length > 0) {
        const testProduct = products[0];
        const base = getBaseName(testProduct.name);
        console.log(`\nQuerying variants for Base: "${base}"`);

        const { data: variants, error: vError } = await supabase
            .from('products')
            .select('name, slug')
            .ilike('name', `%${base}%`);

        if (vError) console.error(vError);
        else {
            console.log(`Found ${variants.length} potential variants.`);
            // Simulating Model Filter
            const currentLower = testProduct.name.toLowerCase();
            const filtered = variants.filter(v => {
                const checkModelMismatch = (candidateName) => {
                    const cLower = candidateName.toLowerCase();
                    const keywords = ['pro', 'max', 'plus', 'ultra', 'mini', 'air', 'fe', 'lite', 'se', 'm2', 'm3', 'm1', '12.9', '11', '10.9', '13'];
                    // Added dimensions to keywords logic manually to see if they matter

                    // Same logic as component...
                    return false; // manual check for now
                };
                return true;
            });
            filtered.forEach(v => console.log(` - ${v.name}`));
        }
    }
}

checkTablets();
