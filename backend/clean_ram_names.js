const { createClient } = require('@supabase/supabase-js');

// Hardcoded creds since env reading was flaky and `pip` failed
const url = "https://eupwqhesbcjczsdgkurh.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cHdxaGVzYmNqY3pzZGdrdXJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDgzNzc3NiwiZXhwIjoyMDgwNDEzNzc2fQ.iuyn8M3WvaFhHjXKkqLNRMsjoVARuvy22TIaAM1YJ80";

const supabase = createClient(url, key);

async function cleanNames() {
    console.log("Fetching products...");
    const { data: products, error } = await supabase
        .from('products')
        .select('id, name');

    if (error) {
        console.error("Error fetching:", error);
        return;
    }

    if (!products || products.length === 0) {
        console.log("No products found.");
        return;
    }

    console.log(`Checking ${products.length} products...`);

    // Regex: Matches " 12 GB/" or " 8 GB/" etc. (Case insensitive)
    // We replace it with " " (space)
    const pattern = /\s\d+\s?GB\//i;

    let count = 0;
    for (const p of products) {
        const oldName = p.name;
        if (pattern.test(oldName)) {
            let newName = oldName.replace(pattern, ' ');
            // Clean double spaces
            newName = newName.replace(/\s+/g, ' ').trim();

            if (oldName !== newName) {
                console.log(`Updating: '${oldName}' -> '${newName}'`);
                const { error: updateError } = await supabase
                    .from('products')
                    .update({ name: newName })
                    .eq('id', p.id);

                if (updateError) {
                    console.error("Update failed:", updateError.message);
                } else {
                    count++;
                }
            }
        }
    }

    console.log(`Finished. Updated ${count} product names.`);
}

cleanNames();
