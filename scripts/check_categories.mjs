
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://eupwqhesbcjczsdgkurh.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cHdxaGVzYmNqY3pzZGdrdXJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDgzNzc3NiwiZXhwIjoyMDgwNDEzNzc2fQ.iuyn8M3WvaFhHjXKkqLNRMsjoVARuvy22TIaAM1YJ80";
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function check() {
    console.log("Checking Categories...");

    // Check Phones
    const { data: phones } = await supabase
        .from('products')
        .select('name, category, subcategory')
        .ilike('name', '%iPhone 15 Pro 128%')
        .limit(5);
    console.log("Phones Sample:", phones);

    // Check Tablets
    const { data: tablets } = await supabase
        .from('products')
        .select('name, category, subcategory')
        .ilike('name', '%Tab S9%')
        .limit(5);
    console.log("Tablets Sample:", tablets);
}

check();
