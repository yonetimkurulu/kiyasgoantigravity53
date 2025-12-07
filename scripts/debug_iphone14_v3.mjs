
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://eupwqhesbcjczsdgkurh.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cHdxaGVzYmNqY3pzZGdrdXJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDgzNzc3NiwiZXhwIjoyMDgwNDEzNzc2fQ.iuyn8M3WvaFhHjXKkqLNRMsjoVARuvy22TIaAM1YJ80";
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function debugIphoneV3() {
    console.log("--- Checking iPhone 14 Variants (V3) ---");
    const { data: i14, error } = await supabase
        .from('products')
        .select('name, slug')
        .ilike('name', '%iPhone 14%');

    if (error) {
        console.error("Error:", error);
    } else {
        console.log(`Found ${i14.length} variants:`);
        i14.forEach(p => console.log(` - ${p.name}`));
    }
}

debugIphoneV3();
