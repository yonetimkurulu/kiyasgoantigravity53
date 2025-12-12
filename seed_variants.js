const { createClient } = require('@supabase/supabase-js');

// Config
const SUPABASE_URL = "https://eupwqhesbcjczsdgkurh.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cHdxaGVzYmNqY3pzZGdrdXJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDgzNzc3NiwiZXhwIjoyMDgwNDEzNzc2fQ.iuyn8M3WvaFhHjXKkqLNRMsjoVARuvy22TIaAM1YJ80";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const COMMON_COLORS = ['Siyah', 'Beyaz', 'Mavi', 'Altın', 'Gri']; // Standard set

async function seedAllVariants() {
    console.log("Starting Mass Seeding Process...");

    // 1. Fetch potential devices (products with GB/TB in name)
    // We limit to 1000 to be safe, can run multiple times or pagination if needed.
    const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .or('name.ilike.%GB%,name.ilike.%TB%')
        .limit(1000);

    if (error) {
        console.error("Error fetching products:", error);
        return;
    }

    console.log(`Found ${products.length} potential devices.`);

    let insertedCount = 0;

    for (const p of products) {
        // Skip if product already has a color name in it (don't double color)
        // Simple check: matches our color regex?
        const colorPattern = /(Siyah|Beyaz|Mavi|Kırmızı|Yeşil|Sarı|Mor|Gri|Gümüş|Altın|Pembe|Turuncu|Lacivert|Krem|Bej|Bordo|Black|White|Blue|Red|Green|Yellow|Purple|Grey|Silver|Gold|Pink|Orange|Navy|Cream|Beige|Midnight|Starlight|Graphite|Space|Titanium|Natural|Sierra|Alpine|Deep|Jet|Mat|Parlak|Rose|Dark|Light|Titanyum|Gece|Yıldız|Uzay|Menekşe|Okyanus|Kehribar|Bakır|Zümrüt|Safir)/i;

        if (colorPattern.test(p.name)) {
            // Already colored, skip generating generic variants for it
            continue;
        }

        // Generate variants
        for (const color of COMMON_COLORS) {
            const newName = `${p.name} ${color} `;
            // safe slug generation
            const slugSuffix = color.toLowerCase()
                .replace(/ı/g, 'i')
                .replace(/ş/g, 's')
                .replace(/ç/g, 'c')
                .replace(/ğ/g, 'g')
                .replace(/u/g, 'u') // redundant but safe
                .replace(/ü/g, 'u')
                .replace(/ö/g, 'o');

            const newSlug = `${p.slug} -${slugSuffix} `;

            // Check existence locally would be too slow for mass, check DB?
            // "on conflict do nothing" is best if slug is unique constraint
            // But we don't have constraints access here easily. 
            // We'll trust the 'data' check.

            const { id, created_at, ...pData } = p;
            const newProduct = {
                ...pData,
                name: newName,
                slug: newSlug,
                // price: p.price // Same price
            };

            // Try insert
            const { error: insertError } = await supabase.from('products').insert(newProduct).select('id').maybeSingle();

            if (!insertError) {
                insertedCount++;
                if (insertedCount % 10 === 0) process.stdout.write('.');
            }
        }
    }

    console.log(`\nMass Seeding Complete.Inserted ${insertedCount} new variants.`);
}

seedAllVariants();
