
import ClientKiyasGo from './ClientKiyasGo.js';
import { supabaseAdmin } from '@/lib/supabase';

// Revalidate every 60 seconds (or 0 for dynamic)
export const revalidate = 0;

export default async function Home() {
  let liveData = [];

  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('name, price, image, link, source');

    if (data) {
      liveData = data;
    }
  } catch (error) {
    console.error('Supabase fetch error:', error);
  }

  return <ClientKiyasGo initialCategory="anasayfa" liveData={liveData} />;
}