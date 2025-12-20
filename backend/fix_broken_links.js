const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPathLocal = path.resolve(__dirname, '../.env.local');
const envPath = path.resolve(__dirname, '../.env');
let rawEnv = '';

try {
    if (fs.existsSync(envPathLocal)) rawEnv += fs.readFileSync(envPathLocal, 'utf8') + '\n';
    if (fs.existsSync(envPath)) rawEnv += fs.readFileSync(envPath, 'utf8') + '\n';
} catch (e) { console.error(e); }

const env = {};
rawEnv.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
        const key = parts[0].trim();
        const val = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
        env[key] = val;
    }
});

const url = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.SUPABASE_KEY;

if (!url || !key) { console.error("Missing keys"); process.exit(1); }

const supabase = createClient(url, key);

async function fix() {
    console.log("Fixing subcategories...");

    // 1. Fix 'oyun-bilgisayari' -> 'laptop'
    console.log("Updating 'oyun-bilgisayari' -> 'laptop'...");
    const { error: err1 } = await supabase
        .from('products')
        .update({ subcategory: 'laptop' })
        .eq('subcategory', 'oyun-bilgisayari');
    if (err1) console.error("Error 1:", err1.message);
    else console.log("Fixed oyun-bilgisayari.");

    // 2. Fix specific 'Xiaomi Pad 6' (diger -> tablet)
    // We search by name to be safe
    console.log("Updating 'Xiaomi Pad 6' -> 'tablet'...");
    const { error: err2 } = await supabase
        .from('products')
        .update({ subcategory: 'tablet', category: 'elektronik' })
        .ilike('name', '%Xiaomi Pad 6%');
    if (err2) console.error("Error 2:", err2.message);
    else console.log("Fixed Xiaomi Pad 6.");

    // 3. Fix generic 'tablet-pc', 'ipad' -> 'tablet' just in case
    // (Optional, but good cleanup)
}

fix();
