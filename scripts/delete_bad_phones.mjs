
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://eupwqhesbcjczsdgkurh.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cHdxaGVzYmNqY3pzZGdrdXJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDgzNzc3NiwiZXhwIjoyMDgwNDEzNzc2fQ.iuyn8M3WvaFhHjXKkqLNRMsjoVARuvy22TIaAM1YJ80";
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function run() {
    console.log("Searching for 'cep-telefonu' products without GB/TB in name...");

    const { data: phones, error } = await supabase
        .from('products')
        .select('id, name')
        .eq('subcategory', 'cep-telefonu');

    if (error) {
        console.error("Fetch Error:", error);
        return;
    }

    // Filter out names that do NOT have GB or TB
    // These are the "generic" entries we want to remove
    const badPhones = phones.filter(p =>
        !p.name.includes("GB") &&
        !p.name.includes("TB")
    );

    if (badPhones.length === 0) {
        console.log("No matching 'bad' phones found to delete.");
        return;
    }

    console.log(`Found ${badPhones.length} phones to delete (e.g., '${badPhones[0].name}').`);

    const idsToDelete = badPhones.map(p => p.id);

    // Perform deletion
    const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .in('id', idsToDelete);

    if (deleteError) {
        console.error("Delete Error:", deleteError);
    } else {
        console.log("Successfully deleted generic phone entries.");
    }
}

run();
