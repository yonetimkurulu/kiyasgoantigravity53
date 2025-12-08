
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://eupwqhesbcjczsdgkurh.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cHdxaGVzYmNqY3pzZGdrdXJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDgzNzc3NiwiZXhwIjoyMDgwNDEzNzc2fQ.iuyn8M3WvaFhHjXKkqLNRMsjoVARuvy22TIaAM1YJ80";
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function check() {
    console.log("--- Checking Slugs for 'cep-telefonu' ---");
    const { data: phones, error } = await supabase
        .from('products')
        .select('name, slug')
        .eq('subcategory', 'cep-telefonu')
        .limit(20);

    if (error) {
        console.error(error);
        return;
    }

    phones.forEach(p => {
        console.log(`Name: ${p.name} | Slug: ${p.slug}`);
    });
}

check();
