import { ELECTRONICS_SUBCATEGORIES } from '../../data';
import ClientKiyasGo from '../../ClientKiyasGo';
import ProductDetailView from '../../components/ProductDetailView';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://eupwqhesbcjczsdgkurh.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cHdxaGVzYmNqY3pzZGdrdXJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDgzNzc3NiwiZXhwIjoyMDgwNDEzNzc2fQ.iuyn8M3WvaFhHjXKkqLNRMsjoVARuvy22TIaAM1YJ80";
const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY);

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Page({ params }) {
  const { category, productId } = params;

  // Check if productId is actually a subcategory ID (e.g. "tablet")
  const isSubcategory = ELECTRONICS_SUBCATEGORIES.some(sub => sub.id === productId);

  if (isSubcategory) {
    // Render Listing View
    let liveData = [];
    try {
      const { data } = await supabaseAdmin.from('products').select('*');
      if (data) liveData = data;
    } catch (e) {
      console.error(e);
    }
    return <ClientKiyasGo initialCategory={category} initialSubcategory={productId} liveData={liveData} />;
  }

  // Otherwise Render Product Detail View
  return <ProductDetailView params={params} />;
}
