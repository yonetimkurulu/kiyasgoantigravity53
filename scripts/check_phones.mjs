
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://eupwqhesbcjczsdgkurh.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cHdxaGVzYmNqY3pzZGdrdXJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDgzNzc3NiwiZXhwIjoyMDgwNDEzNzc2fQ.iuyn8M3WvaFhHjXKkqLNRMsjoVARuvy22TIaAM1YJ80";
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function check() {
    console.log("--- Listing Phones (subcategory: cep-telefonu) ---");
    const { data: phones, error } = await supabase
        .from('products')
        .select('name, id')
        .eq('subcategory', 'cep-telefonu');

    if (error) {
        console.error(error);
        return;
    }

    if (!phones || phones.length === 0) {
        console.log("No phones found.");
        return;
    }

    phones.forEach(p => {
        const hasGB = p.name.includes("GB") || p.name.includes("TB");
        console.log(`${hasGB ? "[OK]" : "[BAD]"} ${p.name}`);
    });
}

check();
