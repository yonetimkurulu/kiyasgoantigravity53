
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://eupwqhesbcjczsdgkurh.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cHdxaGVzYmNqY3pzZGdrdXJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDgzNzc3NiwiZXhwIjoyMDgwNDEzNzc2fQ.iuyn8M3WvaFhHjXKkqLNRMsjoVARuvy22TIaAM1YJ80";
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function simulate(productName) {
    console.log(`\n--- Simulating for: "${productName}" ---`);

    // 1. Logic from ProductDetailView.js
    let baseName = productName
        .replace(/^(Apple|Samsung|Xiaomi|Huawei|Oppo|Vivo|Realme|OnePlus|General Mobile|Reeder|Casper|Honor|Poco|Tecno|Infinix|Google|Asus|Sony|Vestel|Omix)\s+/i, '')
        .replace(/\s(16|32|64|128|256|512)\s?GB/gi, '')
        .replace(/\s1\s?TB/gi, '')
        .replace(/\s\d{1,2}\s?GB\s?RAM/gi, '')
        .trim();

    console.log(`Base Name Extracted: "${baseName}"`);

    // 2. Fetch
    const { data } = await supabase
        .from('products')
        .select('id, name, slug, specs')
        .ilike('name', `%${baseName}%`)
        .limit(30);

    console.log(`Found ${data?.length || 0} raw matches.`);

    if (!data) return;

    // 3. Filter
    const cleanVariants = data.map(v => {
        let storage = null;
        const nameMatch = v.name.match(/(16|32|64|128|256|512)\s?GB|1\s?TB/i);
        if (nameMatch) {
            storage = nameMatch[0].toUpperCase();
        } else if (v.specs?.storage) {
            storage = v.specs.storage;
        }

        let vNameNormalized = v.name
            .replace(/^(Apple|Samsung|Xiaomi|Huawei|Oppo|Vivo|Realme|OnePlus|General Mobile|Reeder|Casper|Honor|Poco|Tecno|Infinix|Google|Asus|Sony|Vestel|Omix)\s+/i, '')
            .replace(/\s(16|32|64|128|256|512)\s?GB/gi, '')
            .replace(/\s1\s?TB/gi, '')
            .replace(/\s\d{1,2}\s?GB\s?RAM/gi, '')
            .trim();

        const isBaseMatch = vNameNormalized.toLowerCase() === baseName.toLowerCase();

        console.log(`\nCandidate: "${v.name}"`);
        console.log(`   Normalized: "${vNameNormalized}"`);
        console.log(`   Is Base Match? ${isBaseMatch}`);
        console.log(`   Storage Parsed: "${storage}"`);

        if (!isBaseMatch) return null;

        return {
            ...v,
            storage: storage || 'Standart'
        };
    })
        .filter(v => v !== null)
        .filter(v => v.storage && (v.storage.includes('GB') || v.storage.includes('TB'))); // STRICT FILTER

    console.log(`\nFinal Variants Count: ${cleanVariants.length}`);
    cleanVariants.forEach(v => console.log(`   -> ${v.name} [${v.storage}]`));
}

simulate("Apple iPhone 15 Pro");
simulate("Samsung Galaxy S24 Ultra");
