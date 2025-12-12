const { createClient } = require('@supabase/supabase-js');

// Config from page.js
const SUPABASE_URL = "https://eupwqhesbcjczsdgkurh.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cHdxaGVzYmNqY3pzZGdrdXJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDgzNzc3NiwiZXhwIjoyMDgwNDEzNzc2fQ.iuyn8M3WvaFhHjXKkqLNRMsjoVARuvy22TIaAM1YJ80";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// Updated Regex
const colorPattern = /(Siyah|Beyaz|Mavi|Kırmızı|Yeşil|Sarı|Mor|Gri|Gümüş|Altın|Pembe|Turuncu|Lacivert|Krem|Bej|Bordo|Black|White|Blue|Red|Green|Yellow|Purple|Grey|Silver|Gold|Pink|Orange|Navy|Cream|Beige|Midnight|Starlight|Graphite|Space|Titanium|Natural|Sierra|Alpine|Deep|Jet|Mat|Parlak|Rose|Dark|Light|Titanyum|Gece|Yıldız|Uzay|Menekşe|Okyanus|Kehribar|Bakır|Zümrüt|Safir|Işığı|Yarısı)/gi;

const getBaseName = (name) => {
    if (!name) return "";
    return name
        .toLowerCase()
        .replace(/^(apple|samsung|xiaomi|huawei|oppo|vivo|realme|oneplus|general mobile|reeder|casper|honor|poco|tecno|infinix|google|asus|sony|vestel|omix)\s+/gi, '')
        .replace(/\s(16|32|64|128|256|512)\s?gb|1\s?tb/gi, '')
        .replace(/\s\d{1,2}\s?gb\s?ram/gi, '')
        .replace(colorPattern, '')
        .replace(/[\(\)\[\]]/g, '')
        .replace(/(\s|^)(5g|4g|lte)(\s|$)/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
};

async function testProduct(productName) {
    console.log(`\n==================================================`);
    console.log(`TESTING: "${productName}"`);
    console.log(`==================================================`);

    // 1. Get Base Name
    const baseName = getBaseName(productName);
    console.log(`Calculated Base Name: "${baseName}"`);

    if (baseName.length < 3) {
        console.log("SKIP: Base name too short.");
        return;
    }

    // 2. Query Supabase
    // We select ALL matches to see what's actually in DB
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .ilike('name', `%${baseName}%`)
        .limit(200);

    if (error) {
        console.error("Supabase Error:", error);
        return;
    }

    console.log(`Total Candidates Found (ilike): ${data.length}`);

    // 3. Inspect Candidates
    console.log(`\n--- Inspecting Candidates ---`);
    let strictCount = 0;

    for (const item of data) {
        const itemBase = getBaseName(item.name);
        const isStrict = itemBase === baseName;

        if (isStrict) strictCount++;

        // Log interesting ones (limit log spam)
        // Show first 10 always, then maybe sample
        if (data.indexOf(item) < 10) {
            console.log(`[${isStrict ? 'MATCH' : 'SKIP'}] "${item.name}" -> Base: "${itemBase}"`);
        }
    }

    if (data.length > 10) console.log(`... and ${data.length - 10} more.`);

    console.log(`\nTotal Strict Matches: ${strictCount}`);

    // 4. Summarize Variants from STRICT matches
    const strictMatches = data.filter(item => getBaseName(item.name) === baseName);

    if (strictMatches.length > 0) {
        console.log("--- SAMPLE ROW DATA ---");
        console.log(JSON.stringify(strictMatches[0], null, 2));
    }

    if (strictMatches.length === 0) {
        console.log("WARN: No strict matches found. This product has no variants in DB.");
        return;
    }

    const variants = strictMatches.map(v => {
        const sMatch = v.name.match(/(16|32|64|128|256|512)\s?GB|1\s?TB/i);
        const storage = sMatch ? sMatch[0].toUpperCase() : 'NO_STORAGE';

        const cMatches = v.name.match(colorPattern);
        const color = cMatches ? cMatches.join(' ') : 'NO_COLOR';

        return { name: v.name, storage, color };
    });

    // Count unique
    const uniqueStorages = [...new Set(variants.map(v => v.storage))];
    const uniqueColors = [...new Set(variants.map(v => v.color))];

    console.log(`\n--- Results Logic ---`);
    console.log(`Unique Storages: ${uniqueStorages.join(', ')}`);
    console.log(`Unique Colors: ${uniqueColors.join(', ')}`);
}

async function countProducts() {
    const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('subcategory', 'cep-telefonu');

    console.log(`Total 'cep-telefonu' in DB: ${count}`);
    if (error) console.error(error);
}

// Run test cases
async function run() {
    await countProducts();
    // await testProduct("Samsung Galaxy M55 5G 128 GB Altın");
}

run();
