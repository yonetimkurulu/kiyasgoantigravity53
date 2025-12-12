import { createClient } from '@supabase/supabase-js';
import ClientKiyasGo from '../ClientKiyasGo';
import ProductDetailView from '../components/ProductDetailView';
import { notFound, redirect } from 'next/navigation';
import { ELECTRONICS_SUBCATEGORIES } from '@/app/data';
// Import other categories if defined elsewhere or hardcode check

// Initialize Supabase Admin for Server Side Fetching
const SUPABASE_URL = "https://eupwqhesbcjczsdgkurh.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cHdxaGVzYmNqY3pzZGdrdXJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDgzNzc3NiwiZXhwIjoyMDgwNDEzNzc2fQ.iuyn8M3WvaFhHjXKkqLNRMsjoVARuvy22TIaAM1YJ80";
const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY);

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Page({ params }) {
    const { slug } = params;

    // 1. Root Level (e.g., /elektronik or /cep-telefonu)
    if (slug.length === 1) {
        const segment = slug[0];

        // CHECK IF IT IS A KNOWN CATEGORY (e.g. elektronik)
        // Ideally fetch this list from a shared constant.
        const KNOWN_CATEGORIES = ['elektronik', 'ev-yasam', 'moda', 'anne-bebek', 'kozmetik', 'supermarket', 'spor'];

        if (KNOWN_CATEGORIES.includes(segment)) {
            // Fetch all data (or filtered)
            let liveData = [];
            try {
                const { data } = await supabaseAdmin.from('products').select('*');
                if (data) liveData = data;
            } catch (e) { console.error(e) }

            return <ClientKiyasGo initialCategory={segment} liveData={liveData} />;
        }

        // CHECK IF IT IS A KNOWN SUBCATEGORY (e.g. cep-telefonu)
        // Flatten all subcategories from imported data
        const ALL_SUBCATS = [...ELECTRONICS_SUBCATEGORIES.map(s => s.id)];

        if (ALL_SUBCATS.includes(segment)) {
            // It's a subcategory at root level
            // Fetch data (maybe filter by subcategory server side for opt, but ClientKiyasGo handles it)
            let liveData = [];
            try {
                const { data } = await supabaseAdmin.from('products').select('*');
                if (data) liveData = data;
            } catch (e) { console.error(e) }

            // Guess the parent category? For 'cep-telefonu' it is 'elektronik'
            // We can find it by searching ELECTRONICS_SUBCATEGORIES
            const parentCat = ELECTRONICS_SUBCATEGORIES.find(s => s.id === segment) ? 'elektronik' : 'other';

            return <ClientKiyasGo initialCategory={parentCat} initialSubcategory={segment} liveData={liveData} />;
        }

        // If unknown, 404
        return notFound();
    }

    // 2. Second Level (e.g., /elektronik/cep-telefonu OR /cep-telefonu/en-ucuz-iphone-fiyati)
    if (slug.length === 2) {
        const [seg1, seg2] = slug;

        // Pattern A: /Category/Subcategory (Legacy or Explicit)
        // e.g. /elektronik/cep-telefonu
        // We should Redirect to /cep-telefonu if we want to enforce new URL structure, OR just render it.
        // User wants "bizim linkleri bu şekle çevirelim" -> implying canonical structure.
        // Let's SUPPORT both but prefer Short URL.

        const ALL_SUBCATS = [...ELECTRONICS_SUBCATEGORIES.map(s => s.id)];

        if (ALL_SUBCATS.includes(seg2) && ['elektronik'].includes(seg1)) {
            // It is /elektronik/cep-telefonu -> Redirect to /cep-telefonu logic?
            // Or just render.
            // Let's render for now.
            let liveData = [];
            try {
                const { data } = await supabaseAdmin.from('products').select('*');
                if (data) liveData = data;
            } catch (e) { console.error(e) }
            return <ClientKiyasGo initialCategory={seg1} initialSubcategory={seg2} liveData={liveData} />;
        }

        // Pattern B: /Subcategory/ProductSlug (NEW URL FORMAT)
        // e.g. /cep-telefonu/en-ucuz-iphone-15-pro-fiyati
        if (ALL_SUBCATS.includes(seg1)) {
            // seg2 is the product slug with prefix/suffix
            /* 
              Parser Logic:
              "en-ucuz-iphone-15-pro-fiyati" -> "iphone-15-pro"
              or check DB with ilike name.
            */

            let searchSlug = seg2;
            if (searchSlug.startsWith('en-ucuz-')) searchSlug = searchSlug.replace('en-ucuz-', '');
            if (searchSlug.endsWith('-fiyati')) searchSlug = searchSlug.replace(/-fiyati$/, '');

            // Try to find product
            let productData = null;
            try {
                // 1. Try finding by SLUG
                const { data: dataBySlug } = await supabaseAdmin
                    .from('products')
                    .select('*')
                    .eq('slug', searchSlug)
                    .maybeSingle();

                if (dataBySlug) {
                    productData = dataBySlug;
                } else {
                    // 2. Try by Name (reconstruct from slug)
                    // "iphone-15-pro" -> "iphone 15 pro"
                    const searchTerm = searchSlug.replace(/-/g, ' ');
                    const { data: dataByName } = await supabaseAdmin
                        .from('products')
                        .select('*')
                        .ilike('name', `%${searchTerm}%`)
                        .limit(1);

                    if (dataByName && dataByName.length > 0) productData = dataByName[0];
                }
            } catch (e) { console.error(e) }

            if (productData) {
                // Found!
                // Construct pseudo-params for ProductDetailView
                const fakeParams = {
                    category: 'elektronik', // TODO: dynamic parent category lookup
                    subcategory: seg1,
                    productId: productData.slug
                };
                return <ProductDetailView params={fakeParams} initialProduct={productData} category="elektronik" />;
            }
        }
    }

    return notFound();
}
