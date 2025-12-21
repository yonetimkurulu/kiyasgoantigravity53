
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config(); // Standard load from .env in CWD

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Note: If reusing ANON key, RLS might block updates. But user has SERVICE_KEY in .env typically.
if (!supabaseUrl || !supabaseKey) {
    console.error("Missing SUPABASE Credentials. URL:", !!supabaseUrl, "Key:", !!supabaseKey);
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncSpecs() {
    console.log("Starting Specs Sync (Root Script)...");
    const specsFilePath = path.join(__dirname, 'app/utils/product_specs_data.js');
    const fileContent = fs.readFileSync(specsFilePath, 'utf8');
    const lines = fileContent.split('\n');
    let insideObject = false;
    let currentSlug = null;
    let currentSpecs = {};
    let updates = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const startMatch = line.match(/^"([^"]+)":\s*{/);
        if (startMatch) {
            currentSlug = startMatch[1];
            currentSpecs = {};
            insideObject = true;
            continue;
        }

        if (insideObject) {
            if (line.startsWith('},')) {
                updates.push({ slug: currentSlug, specs: currentSpecs });
                insideObject = false;
                currentSlug = null;
            } else if (line.startsWith('}')) {
                updates.push({ slug: currentSlug, specs: currentSpecs });
                insideObject = false;
                currentSlug = null;
            } else {
                const parts = line.split(':');
                if (parts.length >= 2) {
                    let key = parts[0].trim().replace(/^"|"$/g, '');
                    let value = parts.slice(1).join(':').trim();
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

    for (const update of updates) {
        if (Object.keys(update.specs).length === 0) continue;
        const { error } = await supabase
            .from('products')
            .update({ specs: update.specs })
            .eq('slug', update.slug);

        if (error) console.log(`Error ${update.slug}:`, error.message);
    }
    console.log("Sync Complete.");
}

syncSpecs();
