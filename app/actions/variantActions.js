'use server'

import { createClient } from '@supabase/supabase-js';

// Initialize Admin Client with Service Key to bypass RLS
const SUPABASE_URL = "https://eupwqhesbcjczsdgkurh.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cHdxaGVzYmNqY3pzZGdrdXJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDgzNzc3NiwiZXhwIjoyMDgwNDEzNzc2fQ.iuyn8M3WvaFhHjXKkqLNRMsjoVARuvy22TIaAM1YJ80";

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
    }
});

export async function fetchVariantsAction(baseName) {
    if (!baseName || baseName.length < 3) return { success: false, data: [] };

    try {
        const { data, error } = await supabaseAdmin
            .from('products')
            .select('id, name, slug, image, price, store1_price')
            .ilike('name', `%${baseName}%`)
            .limit(200);

        if (error) {
            console.error('Server Variant Fetch Error:', error);
            return { success: false, error: error.message };
        }

        return { success: true, data };
    } catch (err) {
        console.error('Server Action Error:', err);
        return { success: false, error: err.message };
    }
}
