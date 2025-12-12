import ClientKiyasGo from '../../ClientKiyasGo';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://eupwqhesbcjczsdgkurh.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cHdxaGVzYmNqY3pzZGdrdXJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDgzNzc3NiwiZXhwIjoyMDgwNDEzNzc2fQ.iuyn8M3WvaFhHjXKkqLNRMsjoVARuvy22TIaAM1YJ80";
const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY);

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SubcategoryPage({ params }) {
    const { category, subcategory } = params;

    // This page matches /:category/:subcategory
    // It renders the listing for that subcategory.

    let liveData = [];
    try {
        // Check if we should filter by subcategory here or let ClientKiyasGo handle it?
        // ClientKiyasGo takes initialCategory and initialSubcategory and filters.
        // So we just pass all data (or filtered data if we want optimization).
        // For now, fetching all like before to keep it simple and consistent.
        const { data } = await supabaseAdmin.from('products').select('*');
        if (data) liveData = data;
    } catch (e) {
        console.error(e);
    }

    return <ClientKiyasGo initialCategory={category} initialSubcategory={subcategory} liveData={liveData} />;
}
