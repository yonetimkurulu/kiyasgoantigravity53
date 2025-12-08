import ProductDetailView from '../../components/ProductDetailView';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://eupwqhesbcjczsdgkurh.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cHdxaGVzYmNqY3pzZGdrdXJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDgzNzc3NiwiZXhwIjoyMDgwNDEzNzc2fQ.iuyn8M3WvaFhHjXKkqLNRMsjoVARuvy22TIaAM1YJ80";
const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY);

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Page({ params }) {
  const { category, subcategory, productId } = params;

  // This page matches /:category/:subcategory/:productId
  // It is exclusively for PRODUCT DETAILS.

  // Fetch product data server-side
  let productData = null;

  try {
    // 1. Try finding by SLUG (Best practice)
    const { data: dataBySlug } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('slug', productId)
      .maybeSingle();

    if (dataBySlug) {
      productData = dataBySlug;
    } else {
      // 2. Fallback: Try finding by NAME
      const searchTerm = productId.replace(/-/g, ' ');
      const { data: dataByName } = await supabaseAdmin
        .from('products')
        .select('*')
        .ilike('name', `%${searchTerm}%`)
        .maybeSingle();

      if (dataByName) {
        productData = dataByName;
      } else {
        // 3. Last resort: Try loose match
        const { data: dataByName2 } = await supabaseAdmin
          .from('products')
          .select('*')
          .ilike('name', `%${productId}%`)
          .maybeSingle();
        if (dataByName2) productData = dataByName2;
      }
    }
  } catch (e) {
    console.error("Server fetch error", e);
  }

  return <ProductDetailView params={params} initialProduct={productData} />;
}
