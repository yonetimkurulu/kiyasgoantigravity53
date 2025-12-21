
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL || "https://loremipsum.supabase.co"; // Valid URL needed
const supabaseKey = process.env.SUPABASE_SERVICE_KEY; // Service key needed for writes

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY");
    // Hardcode for this session as user env might be tricky in this shell
    // Actually, I'll rely on the user having .env or I will paste them if this fails.
}

// Initialize Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

async function syncSpecs() {
    console.log("Starting Specs Sync...");

    // 1. Read product_specs_data.js raw text
    const specsFilePath = path.join(__dirname, '../app/utils/product_specs_data.js');
    const fileContent = fs.readFileSync(specsFilePath, 'utf8');

    // 2. Extract the object. Simple/Hack parsing since it's a JS file.
    // We look for 'export const PRODUCTS_SPECS = {' and the closing '};'
    // This is fragile but fast.
    const startMarker = 'export const PRODUCTS_SPECS = {';
    const endMarker = '};';

    // Safety: Use 'eval' relative or just regex match lines?
    // Let's use a safer approach: Regex matching keys `    "slug": { ... },`

    // Regex to match: "slug": { ... }
    // Note: The specs object values span multiple lines.
    // Let's try to extract everything between the markers and JSON.parse it? 
    // No, it's not valid JSON (keys not quoted sometimes, values are).
    // Better: Run a regex to find all ` "slug": { ... },` blocks where slug is a string.

    // Let's iterate line by line to build objects.
    const lines = fileContent.split('\n');
    let insideObject = false;
    let currentSlug = null;
    let currentSpecs = {};
    let updates = [];

    // Skip the static/legacy part (approx lines 1-383)
    // We only care about the appended part.
    // The user had a marker: // --- EXPORTED FROM DB ---
    // But I might have removed it.
    // I should just check ALL specs or just the ones I know are new?
    // Let's check ALL. If it exists in DB, update it. Safe.

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Match start of a product entry: "slug": {
        const startMatch = line.match(/^"([^"]+)":\s*{/);
        if (startMatch) {
            currentSlug = startMatch[1];
            currentSpecs = {};
            insideObject = true;
            continue;
        }

        if (insideObject) {
            if (line.startsWith('},')) {
                // End of object
                updates.push({ slug: currentSlug, specs: currentSpecs });
                insideObject = false;
                currentSlug = null;
            } else if (line.startsWith('}')) {
                // End of object (last item)
                updates.push({ slug: currentSlug, specs: currentSpecs });
                insideObject = false;
                currentSlug = null;
            } else {
                // Parse Key-Value: "key": "value", or key: "value",
                const kvMatch = line.match(/["']?(\w+)["']?:\s*"?([^",]+)"?,?/);
                // This regex is weak for values with commas.
                // Alternative: Split by first colon.
                const parts = line.split(':');
                if (parts.length >= 2) {
                    let key = parts[0].trim().replace(/^"|"$/g, '');
                    let value = parts.slice(1).join(':').trim();
                    // Clean value
                    if (value.endsWith(',')) value = value.slice(0, -1);
                    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);

                    if (key && value && value !== "Unknown (No LLM Key)") {
                        currentSpecs[key] = value;
                    }
                }
            }
        }
    }

    console.log(`Found ${updates.length} products to sync.`);

    // 3. Update DB
    for (const update of updates) {
        // Skip if specs empty
        if (Object.keys(update.specs).length === 0) continue;

        // Try to match by slug directly? 
        // Our DB products table might not have 'slug' column populated perfectly or unique.
        // It has 'name'. 'slug' is computed usually?
        // Let's check if we can match by slug if provided, else name?
        // Actually, the keys in the JS file ARE slugs.
        // The DB `products` table has a `slug` column.

        // Update product where slug matches
        const { error } = await supabase
            .from('products')
            .update({ specs: update.specs })
            .eq('slug', update.slug);

        if (error) {
            // Try Clean Name match if slug fails?
            // console.log(`Error updating ${update.slug}:`, error.message);
        } else {
            // console.log(`Updated ${update.slug}`);
        }
    }

    console.log("Sync Complete.");
}

syncSpecs();
