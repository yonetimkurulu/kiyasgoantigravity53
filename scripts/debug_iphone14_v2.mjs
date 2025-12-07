
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://eupwqhesbcjczsdgkurh.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cHdxaGVzYmNqY3pzZGdrdXJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDgzNzc3NiwiZXhwIjoyMDgwNDEzNzc2fQ.iuyn8M3WvaFhHjXKkqLNRMsjoVARuvy22TIaAM1YJ80";
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function debugIphoneV2() {
    console.log("--- Checking iPhone 14 Variants (V2) ---");
    const { data: i14, error: i14Error } = await supabase
        .from('products')
        .select('name, storage')
        .ilike('name', '%iPhone 14%');

    if (i14Error) {
        console.error("SELECT Error:", i14Error);
    } else {
        console.log("iPhone 14 entries:", i14);
    }

    console.log("\n--- Checking Last 5 Created Products ---");
    const { data: recent, error: recentError } = await supabase
        .from('products')
        .select('name, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

    if (recentError) {
        console.error("RECENT Error:", recentError);
    } else {
        console.log("Recent products:", recent);
    }
}

debugIphoneV2();
