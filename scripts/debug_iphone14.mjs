
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://eupwqhesbcjczsdgkurh.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cHdxaGVzYmNqY3pzZGdrdXJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDgzNzc3NiwiZXhwIjoyMDgwNDEzNzc2fQ.iuyn8M3WvaFhHjXKkqLNRMsjoVARuvy22TIaAM1YJ80";
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function debugIphone() {
    console.log("--- Checking iPhone 14 Variants ---");
    const { data: i14 } = await supabase
        .from('products')
        .select('name, storage')
        .ilike('name', '%iPhone 14%');
    console.log("iPhone 14 entries:", i14);

    console.log("\n--- Checking for NON-GB Products (Generics) ---");
    const { data: generics } = await supabase
        .from('products')
        .select('name')
        .not('name', 'ilike', '%GB%')
        .not('name', 'ilike', '%TB%')
        .limit(10);

    if (generics.length > 0) {
        console.log("WARNING: Found generic products in DB:", generics);
    } else {
        console.log("SUCCESS: No generic products found in DB.");
    }
}

debugIphone();
