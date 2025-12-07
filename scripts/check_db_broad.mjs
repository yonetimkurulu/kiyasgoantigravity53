
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://eupwqhesbcjczsdgkurh.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cHdxaGVzYmNqY3pzZGdrdXJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDgzNzc3NiwiZXhwIjoyMDgwNDEzNzc2fQ.iuyn8M3WvaFhHjXKkqLNRMsjoVARuvy22TIaAM1YJ80";
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function checkBroad() {
    console.log("--- Listing ALL Phone Products in DB ---");
    const { data: phones } = await supabase
        .from('products')
        .select('name, storage')
        .eq('subcategory', 'cep-telefonu')
        .limit(50);

    if (phones && phones.length > 0) {
        console.log(`Found ${phones.length} phones:`);
        phones.forEach(p => console.log(` - ${p.name}`));
    } else {
        console.log("No phones found. Database might be empty.");
    }

    console.log("\n--- Listing ALL Tablet Products in DB ---");
    const { data: tablets } = await supabase
        .from('products')
        .select('name, storage')
        .eq('subcategory', 'tablet')
        .limit(50);

    if (tablets && tablets.length > 0) {
        console.log(`Found ${tablets.length} tablets:`);
        tablets.forEach(p => console.log(` - ${p.name}`));
    } else {
        console.log("No tablets found.");
    }
}

checkBroad();
