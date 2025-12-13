
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://eupwqhesbcjczsdgkurh.supabase.co";
// Key from app/actions/variantActions.js
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cHdxaGVzYmNqY3pzZGdrdXJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDgzNzc3NiwiZXhwIjoyMDgwNDEzNzc2fQ.iuyn8M3WvaFhHjXKkqLNRMsjoVARuvy22TIaAM1YJ80";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function check() {
    console.log("Testing connection with Service Key...");

    // 1. Simple Count
    const { count, error: countError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

    if (countError) {
        console.error("Count Error:", countError);
    } else {
        console.log(`Total Products in DB: ${count}`);
    }

    // 2. Query for M55
    const searchTerm = "Galaxy M55"; // Stripped brand style
    console.log(`\nSearching for '%${searchTerm}%'...`);

    const { data, error } = await supabase
        .from('products')
        .select('id, name, slug')
        .ilike('name', `%${searchTerm}%`);

    if (error) {
        console.error("Search Error:", error);
    } else if (data) {
        console.log(`Found ${data.length} results:`);
        data.forEach(p => console.log(` - [${p.name}] (${p.slug})`));
    }

    // 3. Query for "Apple iPhone 15" with strict BRAND stripping check
    // If I strip brand "Apple", search is "iPhone 15"
    const searchTerm2 = "iPhone 15";
    console.log(`\nSearching for '%${searchTerm2}%'...`);
    const { data: data2, error: error2 } = await supabase
        .from('products')
        .select('id, name, slug')
        .ilike('name', `%${searchTerm2}%`)
        .limit(5);

    if (error2) console.error(error2);
    else data2.forEach(p => console.log(` - [${p.name}]`));

}

check();
