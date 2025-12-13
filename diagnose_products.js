
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://eupwqhesbcjczsdgkurh.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cHdxaGVzYmNqY3pzZGdrdXJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDgzNzc3NiwiZXhwIjoyMDgwNDEzNzc2fQ.iuyn8M3WvaFhHjXKkqLNRMsjoVARuvy22TIaAM1YJ80";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const slugify = (text) => {
    if (!text) return '';
    try {
        text = decodeURIComponent(text);
    } catch (e) { }
    const trMap = {
        'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
        'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u'
    };
    return text.toString()
        .replace(/[çğıöşüÇĞİÖŞÜ]/g, match => trMap[match])
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-');
};

async function run() {
    console.log("Fetching all products...");
    const { data: products, error } = await supabase
        .from('products')
        .select('id, name, slug');

    if (error) {
        console.error("Error:", error);
        return;
    }

    console.log(`Total Products: ${products.length}`);

    // Check for Collisions
    const slugMap = {};
    const collisions = [];

    products.forEach(p => {
        const cleanSlug = slugify(p.slug || p.name);
        if (slugMap[cleanSlug]) {
            collisions.push({
                slug: cleanSlug,
                product1: slugMap[cleanSlug],
                product2: p.name
            });
        }
        slugMap[cleanSlug] = p.name;
    });

    console.log(`\n--- Slug Collisions (${collisions.length}) ---`);
    if (collisions.length > 0) {
        collisions.slice(0, 20).forEach(c => {
            console.log(`Slug: ${c.slug}`);
            console.log(`  - ${c.product1}`);
            console.log(`  - ${c.product2}`);
        });
    } else {
        console.log("No collisions found!");
    }

    // Inspect M55
    console.log("\n--- Samsung M55 Inspection ---");
    const m55s = products.filter(p => p.name.toLowerCase().includes('m55'));
    m55s.forEach(p => {
        console.log(`Name: ${p.name}`);
        console.log(`  Slug (DB): ${p.slug}`);
        console.log(`  Clean: ${slugify(p.slug || p.name)}`);
    });
}

run();
