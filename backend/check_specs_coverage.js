
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCoverage() {
    console.log("Checking Specs Coverage...");

    // Fetch all products, only selecting slug and specs
    // Pagination might be needed if >1000 items, but usually limit is 1000.
    const { data: products, error } = await supabase
        .from('products')
        .select('slug, specs');

    if (error) {
        console.error("Error fetching products:", error.message);
        return;
    }

    const total = products.length;
    let missing = 0;
    let invalid = 0;
    let missingSlugs = [];

    for (const p of products) {
        if (!p.specs) {
            missing++;
            missingSlugs.push(p.slug);
        } else if (Object.keys(p.specs).length === 0) {
            missing++; // Empty object is effectively missing
            missingSlugs.push(p.slug);
        } else {
            // Optional: Check for "Unknown" values again just in case
            const values = Object.values(p.specs);
            const isBad = values.some(v => typeof v === 'string' && v.includes('Unknown (No LLM Key)'));
            if (isBad) {
                invalid++;
                console.log(`Found BAD data in DB for: ${p.slug}`);
            }
        }
    }

    console.log(`Total Products: ${total}`);
    console.log(`Missing Specs: ${missing}`);
    console.log(`Invalid/Bad Specs: ${invalid}`);
    console.log(`Coverage: ${((total - missing - invalid) / total * 100).toFixed(1)}%`);

    if (missing > 0) {
        console.log("\nProducts missing specs (First 20):");
        missingSlugs.slice(0, 20).forEach(s => console.log(`- ${s}`));
        if (missing > 20) console.log(`... and ${missing - 20} more.`);
    }
}

checkCoverage();
