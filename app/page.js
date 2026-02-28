import ClientKiyasGo from './ClientKiyasGo';
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURATION ---
const SUPABASE_URL = "https://eupwqhesbcjczsdgkurh.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cHdxaGVzYmNqY3pzZGdrdXJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDgzNzc3NiwiZXhwIjoyMDgwNDEzNzc2fQ.iuyn8M3WvaFhHjXKkqLNRMsjoVARuvy22TIaAM1YJ80";
const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY);

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Live data

export default async function Home() {
  let liveData = [];
  let topFavorited = [];

  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*');

    if (data) {
      liveData = data;
    }

    const { data: topData } = await supabaseAdmin
      .rpc('get_top_favorited_products', { p_limit: 10, p_category: null });

    if (Array.isArray(topData)) {
      topFavorited = topData;
    }
  } catch (error) {
    console.error('Supabase fetch error:', error);
  }

  return (
    <main>
      <ClientKiyasGo liveData={liveData} topFavorited={topFavorited} />
    </main>
  );
}