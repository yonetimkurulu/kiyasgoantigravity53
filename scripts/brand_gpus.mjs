import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://eupwqhesbcjczsdgkurh.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cHdxaGVzYmNqY3pzZGdrdXJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDgzNzc3NiwiZXhwIjoyMDgwNDEzNzc2fQ.iuyn8M3WvaFhHjXKkqLNRMsjoVARuvy22TIaAM1YJ80";
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const rebrandMap = {
    "NVIDIA GeForce RTX 5090": "MSI GeForce RTX 5090 SUPRIM X 24G",
    "NVIDIA GeForce RTX 5080": "ASUS ROG Strix GeForce RTX 5080 OC",
    "NVIDIA GeForce RTX 5070": "GIGABYTE AORUS GeForce RTX 5070 MASTER",
    "NVIDIA GeForce RTX 5060": "Zotac Gaming GeForce RTX 5060 Twin Edge",
    "Intel Arc B580": "ASRock Intel Arc B580 Challenger OC",
    "Intel Arc A750": "SPARKLE Intel Arc A750 TITAN OC",
    "AMD Radeon RX 7700 XT": "Sapphire NITRO+ Radeon RX 7700 XT",
    "AMD Radeon RX 9060 XT": "XFX Speedster QICK 319 Radeon RX 9060 XT",
    "AMD Radeon RX 9070 XT": "PowerColor Red Devil Radeon RX 9070 XT"
};

async function brandProducts() {
    console.log("Rebranding GPUs...");

    for (const [oldName, newName] of Object.entries(rebrandMap)) {
        console.log(`Updating '${oldName}' -> '${newName}'...`);

        // Check if the generic one exists
        const { data: existing, error: findError } = await supabase
            .from('products')
            .select('id')
            .eq('name', oldName)
            .maybeSingle();

        if (findError) {
            console.error(`Error finding ${oldName}:`, findError.message);
            continue;
        }

        if (existing) {
            // Update it
            const { error: updateError } = await supabase
                .from('products')
                .update({
                    name: newName,
                    slug: newName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, ''),
                    desc: `${newName} ile oyunlarda sınırları zorlayın. En son teknoloji soğutma ve performans.`,
                })
                .eq('id', existing.id);

            if (updateError) {
                console.error(`Failed to update ${oldName}:`, updateError.message);
            } else {
                console.log("Success!");
            }
        } else {
            console.log(`Generic product '${oldName}' not found. Maybe already updated?`);
        }
    }
}

brandProducts();
