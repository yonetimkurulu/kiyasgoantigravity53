
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://eupwqhesbcjczsdgkurh.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cHdxaGVzYmNqY3pzZGdrdXJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDgzNzc3NiwiZXhwIjoyMDgwNDEzNzc2fQ.iuyn8M3WvaFhHjXKkqLNRMsjoVARuvy22TIaAM1YJ80";
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function testRoutingRegex() {
    console.log("Testing Frontend Variant Logic (Regex)...");

    const currentName = "Apple iPhone 15 Pro 128 GB";

    // Logic 1: Extract Base Name
    let baseName = currentName
        .replace(/^(Apple|Samsung|Xiaomi|Huawei|Oppo|Vivo|Realme|OnePlus|General Mobile|Reeder|Casper|Honor|Poco|Tecno|Infinix|Google|Asus|Sony|Vestel|Omix)\s+/i, '')
        .replace(/\s(16|32|64|128|256|512)\s?GB/gi, '')
        .replace(/\s1\s?TB/gi, '')
        .replace(/\s\d{1,2}\s?GB\s?RAM/gi, '')
        .trim();

    console.log(`Base Name Extracted: '${baseName}'`);

    // Fetch Candidates
    const { data: variants } = await supabase
        .from('products')
        .select('name, slug, subcategory, specs')
        .ilike('name', `%${baseName}%`)
        .limit(20);

    if (!variants) {
        console.log("No variants found.");
        return;
    }

    // Logic 2: Map & Extract Storage using Regex
    const processed = variants.map(v => {
        let storage = null;
        const nameMatch = v.name.match(/(16|32|64|128|256|512)\s?GB|1\s?TB/i);
        if (nameMatch) {
            storage = nameMatch[0].toUpperCase();
        }

        // Check base name match
        let vNameNormalized = v.name
            .replace(/^(Apple|Samsung|Xiaomi|Huawei|Oppo|Vivo|Realme|OnePlus|General Mobile|Reeder|Casper|Honor|Poco|Tecno|Infinix|Google|Asus|Sony|Vestel|Omix)\s+/i, '')
            .replace(/\s(16|32|64|128|256|512)\s?GB/gi, '')
            .replace(/\s1\s?TB/gi, '')
            .replace(/\s\d{1,2}\s?GB\s?RAM/gi, '')
            .trim();

        if (vNameNormalized.toLowerCase() !== baseName.toLowerCase()) return null;

        return {
            name: v.name,
            slug: v.slug,
            subcategory: v.subcategory || 'elektronik',
            storage: storage
        };
    })
        .filter(v => v !== null)
        .filter(v => v.storage && (v.storage.includes('GB') || v.storage.includes('TB')))
        .sort((a, b) => parseInt(a.storage) - parseInt(b.storage));

    console.log("\nSimulated Button Output:");
    processed.forEach(v => {
        const url = `/${v.subcategory}/${v.slug}`;
        console.log(`[${v.storage}] -> href="${url}"`);
    });

}

testRoutingRegex();
