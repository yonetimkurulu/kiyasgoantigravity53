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
  // Fetch product data server-side to avoid RLS/Client issues and improve SEO
  let productData = null;

  // Try finding in local data first (optimization)
  /* We can't easily import PRODUCTS_DATA here if it's large, but we can do the same logic as view */
  // Actually, we should just fetch from Supabase to be safe and updated.
  try {
    const { data } = await supabaseAdmin
      .from('products')
      .select('*')
      .or(`slug.eq.${productId},name.eq.${productId.replace(/-/g, ' ')}`) // Try slug first, then loose name match? 
      // Actually, simple slug match or name match.
      // Ideally we match by slug.
      .maybeSingle();

    // Note: productId from URL might be slug OR name-slug.
    // We'll try strict match on slug first.

    if (data) {
      productData = data;
    } else {
      // Fallback: try matching name if productId looks like a name
      const { data: dataByName } = await supabaseAdmin
        .from('products')
        .select('*')
        .ilike('name', productId.replace(/-/g, '%')) // Loose match? 
        .maybeSingle();
      if (dataByName) productData = dataByName;
    }
  } catch (e) {
    console.error("Server fetch error", e);
  }

  return <ProductDetailView params={params} initialProduct={productData} />;
}
