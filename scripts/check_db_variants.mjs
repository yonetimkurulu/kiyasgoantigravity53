
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://eupwqhesbcjczsdgkurh.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cHdxaGVzYmNqY3pzZGdrdXJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDgzNzc3NiwiZXhwIjoyMDgwNDEzNzc2fQ.iuyn8M3WvaFhHjXKkqLNRMsjoVARuvy22TIaAM1YJ80";
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function check() {
    console.log("Checking iPhone 15 Pro...");
    const { data: phones, error } = await supabase
        .from('products')
        .select('name, category, subcategory, slug')
        .ilike('name', '%iPhone 15 Pro%');

    if (error) console.error(error);
    else console.table(phones);

    console.log("\nChecking Tablets...");
    const { data: tabs } = await supabase
        .from('products')
        .select('name, category, subcategory, slug')
        .ilike('name', '%Tab S9%');

    if (tabs) console.table(tabs);
}

check();
