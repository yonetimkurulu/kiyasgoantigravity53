
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://eupwqhesbcjczsdgkurh.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cHdxaGVzYmNqY3pzZGdrdXJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDgzNzc3NiwiZXhwIjoyMDgwNDEzNzc2fQ.iuyn8M3WvaFhHjXKkqLNRMsjoVARuvy22TIaAM1YJ80";
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function clean() {
    console.log("Cleaning old non-GB/TB products in phones/tablets...");

    // Fetch all IDs first to be safe (or directly delete)
    // We want to delete where name NOT LIKE %GB% AND name NOT LIKE %TB%
    // AND subcategory IN ('cep-telefonu', 'tablet')

    const { data: toDelete, error: fetchError } = await supabase
        .from('products')
        .select('id, name')
        .in('subcategory', ['cep-telefonu', 'tablet'])
        .not('name', 'ilike', '%GB%')
        .not('name', 'ilike', '%TB%');

    if (fetchError) {
        console.error("Fetch error:", fetchError);
        return;
    }

    console.log(`Found ${toDelete.length} products to delete:`);
    toDelete.forEach(p => console.log(` - ${p.name}`));

    if (toDelete.length === 0) return;

    const ids = toDelete.map(p => p.id);
    const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .in('id', ids);

    if (deleteError) console.error("Delete error:", deleteError);
    else console.log("Deletion complete.");
}

clean();
