
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateAllFuzzy() {
    console.log("Migrating ALL Specs (Fuzzy Match)...");

    // 1. Fetch All Products from DB to get their slugs
    // We need 'slug' and maybe 'id'.
    // Fetching 1000 at a time loop if needed, but assuming <1000 for now based on previous check (640).
    const { data: dbProducts, error } = await supabase
        .from('products')
        .select('slug, id');

    if (error) {
        console.error("DB Fetch Error:", error.message);
        return;
    }
    console.log(`Loaded ${dbProducts.length} products from DB.`);

    // 2. Parse Static File
    const specsFilePath = path.join(__dirname, '../app/utils/product_specs_data.js');
    const fileContent = fs.readFileSync(specsFilePath, 'utf8');
    const lines = fileContent.split('\n');
    let insideObject = false;
    let currentKey = null;
    let currentSpecs = {};
    let staticEntries = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const startMatch = line.match(/^["']([^"']+)["']:\s*{/);
        if (startMatch) {
            currentKey = startMatch[1];
            currentSpecs = {};
            insideObject = true;
            continue;
        }

        if (insideObject) {
            if (line.startsWith('},') || line === '}') {
                staticEntries.push({ key: currentKey, specs: currentSpecs });
                insideObject = false;
                currentKey = null;
            } else {
                const parts = line.split(':');
                if (parts.length >= 2) {
                    let key = parts[0].trim().replace(/^"|"$/g, '');
                    let value = parts.slice(1).join(':').trim();
                    if (value.endsWith(',')) value = value.slice(0, -1);
                    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
                    if (key && value && !value.includes("Unknown (No LLM Key)")) {
                        currentSpecs[key] = value;
                    }
                }
            }
        }
    }

    console.log(`Found ${staticEntries.length} static spec entries.`);

    // 3. Match and Update
    let updatesCount = 0;

    // Create a map for fast lookup if needed, or just iterate.
    // Iterating static entries against DB products.
    // Logic: If dbProduct.slug INCLUDES staticEntry.key, update it.
    // BUT be careful: "iphone-15" includes "iphone-1".
    // Better logic: Split by dashes? 
    // Or just checking: dbSlug.includes(staticKey) is decent for this dataset.
    // Special handling: "iphone-15" shouldn't match "iphone-15-pro".
    // The static keys are usually specific enough (e.g. iphone-15-pro).
    // But "iphone-15" might match "iphone-15-pro-..." if we are not careful?
    // Actually, "iphone-15" is NOT in "iphone-15-pro" (if checked as whole words or startsWith).
    // Let's rely on standard includes for now, but sort static keys by length DESC to match most specific first?
    // Ex: Match "iphone-15-pro" before "iphone-15".

    staticEntries.sort((a, b) => b.key.length - a.key.length);

    for (const dbProduct of dbProducts) {
        // Find best matching static key
        const match = staticEntries.find(entry => dbProduct.slug.includes(entry.key));

        if (match) {
            // Found a match!
            // Update DB
            const { error: updateError } = await supabase
                .from('products')
                .update({ specs: match.specs })
                .eq('slug', dbProduct.slug);

            if (updateError) {
                console.log(`Failed to update ${dbProduct.slug}: ${updateError.message}`);
            } else {
                updatesCount++;
                if (updatesCount % 50 === 0) console.log(`Updated ${updatesCount} products...`);
            }
        }
    }

    console.log(`Fuzzy Migration Complete. Updated ${updatesCount} products.`);
}

migrateAllFuzzy();
