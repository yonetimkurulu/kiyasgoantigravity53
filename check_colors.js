const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://eupwqhesbcjczsdgkurh.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cHdxaGVzYmNqY3pzZGdrdXJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDgzNzc3NiwiZXhwIjoyMDgwNDEzNzc2fQ.iuyn8M3WvaFhHjXKkqLNRMsjoVARuvy22TIaAM1YJ80";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function checkColors() {
    console.log("Checking for 'Mavi' (Blue)...");
    const { data: blue, error: e1 } = await supabase
        .from('products')
        .select('name')
        .ilike('name', '%Mavi%')
        .limit(5);

    if (blue && blue.length > 0) {
        console.log("Found Blue Items:", blue.map(x => x.name));
    } else {
        console.log("No 'Mavi' items found.");
    }

    console.log("\nChecking for 'Siyah' (Black)...");
    const { data: black, error: e2 } = await supabase
        .from('products')
        .select('name')
        .ilike('name', '%Siyah%')
        .limit(5);

    if (black && black.length > 0) {
        console.log("Found Black Items:", black.map(x => x.name));
    } else {
        console.log("No 'Siyah' items found.");
    }
}

checkColors();
