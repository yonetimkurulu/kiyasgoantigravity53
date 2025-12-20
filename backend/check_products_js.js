const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPathLocal = path.resolve(__dirname, '../.env.local');
const envPath = path.resolve(__dirname, '../.env');
let rawEnv = '';

try {
    if (fs.existsSync(envPathLocal)) rawEnv += fs.readFileSync(envPathLocal, 'utf8') + '\n';
    if (fs.existsSync(envPath)) rawEnv += fs.readFileSync(envPath, 'utf8') + '\n';
} catch (e) {
    console.error("Error reading env files", e);
}

const env = {};
rawEnv.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
        const key = parts[0].trim();
        const val = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
        env[key] = val;
    }
});

console.log("Keys found:", Object.keys(env));

const url = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.SUPABASE_KEY;

if (!url || !key) {
    console.error("Missing credentials. URL or KEY is empty.");
    process.exit(1);
}

const supabase = createClient(url, key);

async function check() {
    console.log("Checking products...");
    const names = ["Xiaomi Pad 6", "Monster Tulpar T7"];

    for (const name of names) {
        console.log(`\n--- Looking for: ${name} ---`);
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .ilike('name', `%${name}%`);

        if (error) {
            console.error("Error:", error.message);
            continue;
        }

        if (data && data.length > 0) {
            data.forEach(p => {
                console.log(`ID: ${p.id}`);
                console.log(`Name: ${p.name}`);
                console.log(`Slug: ${p.slug}`);
                console.log(`Category: ${p.category}`);
                console.log(`Subcategory: ${p.subcategory}`);
                console.log(`Attributes:`, Object.keys(p));
            });
        } else {
            console.log("NOT FOUND.");
        }
    }
}

check();
