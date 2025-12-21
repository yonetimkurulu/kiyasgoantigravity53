
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const s24UltraSpecs = {
    screen: "6.8 inç Dynamic AMOLED 2X",
    processor: "Snapdragon 8 Gen 3 for Galaxy",
    ram: "12 GB",
    battery: "5000 mAh",
    camera: "200 MP + 50 MP + 12 MP + 10 MP",
    os: "Android 14",
    weight: "232 g"
};

const slugs = [
    "samsung-galaxy-s24-ultra-256-gb",
    "samsung-galaxy-s24-ultra-512-gb",
    "samsung-galaxy-s24-ultra-1-tb"
];

async function restoreSpecs() {
    console.log("Restoring S24 Ultra specs...");
    for (const slug of slugs) {
        // We might want to adjust 'storage' for each, but 'specs' JSON usually describes shared hardware.
        // The 'storage' is usually part of the product name or a separate field, but if it was in the specs JSON before:
        const specificSpecs = { ...s24UltraSpecs };
        if (slug.includes('256-gb')) specificSpecs.storage = "256 GB";
        if (slug.includes('512-gb')) specificSpecs.storage = "512 GB";
        if (slug.includes('1-tb')) specificSpecs.storage = "1 TB";

        const { error } = await supabase
            .from('products')
            .update({ specs: specificSpecs })
            .eq('slug', slug);

        if (error) console.error(`Error updating ${slug}:`, error.message);
        else console.log(`Updated ${slug}`);
    }
}

restoreSpecs();
