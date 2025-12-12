import { createClient } from '@supabase/supabase-js';
import ClientKiyasGo from '../ClientKiyasGo';
import ProductDetailView from '../components/ProductDetailView';
import { notFound } from 'next/navigation';
import { ELECTRONICS_SUBCATEGORIES } from '@/app/data';

const SUPABASE_URL = "https://eupwqhesbcjczsdgkurh.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cHdxaGVzYmNqY3pzZGdrdXJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDgzNzc3NiwiZXhwIjoyMDgwNDEzNzc2fQ.iuyn8M3WvaFhHjXKkqLNRMsjoVARuvy22TIaAM1YJ80";
const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY);

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Page({ params }) {
    const { slug } = params;

    // --- 1. Root Level (Category/Subcategory) ---
    if (slug.length === 1) {
        const segment = slug[0];
        const KNOWN_CATEGORIES = ['elektronik', 'ev-yasam', 'moda', 'anne-bebek', 'kozmetik', 'supermarket', 'spor'];
        const ALL_SUBCATS = ELECTRONICS_SUBCATEGORIES.map(s => s.id);

        if (KNOWN_CATEGORIES.includes(segment)) {
            let liveData = [];
            try {
                const { data } = await supabaseAdmin.from('products').select('*');
                if (data) liveData = data;
            } catch (e) { console.error(e) }
            return <ClientKiyasGo initialCategory={segment} liveData={liveData} />;
        }

        if (ALL_SUBCATS.includes(segment)) {
            let liveData = [];
            try {
                const { data } = await supabaseAdmin.from('products').select('*');
                if (data) liveData = data;
            } catch (e) { console.error(e) }
            const parentCat = ELECTRONICS_SUBCATEGORIES.find(s => s.id === segment) ? 'elektronik' : 'other';
            return <ClientKiyasGo initialCategory={parentCat} initialSubcategory={segment} liveData={liveData} />;
        }
        return notFound();
    }

    // --- 2. Product Level (e.g. /cep-telefonu/en-ucuz-iphone-15-fiyati) ---
    if (slug.length === 2) {
        const [seg1, seg2] = slug;
        const ALL_SUBCATS = ELECTRONICS_SUBCATEGORIES.map(s => s.id);

        // Pattern: /subcategory/product-slug
        if (ALL_SUBCATS.includes(seg1)) {
            // Fetch ALL products in this subcategory (or generic 'elektronik' if simpler)
            // Filtering by subcategory in DB relies on text match if 'subcategory' column exists and is accurate.
            // Safe bet: Fetch all 'elektronik' or just ALL products (dataset is small)

            let allProducts = [];
            try {
                const { data } = await supabaseAdmin.from('products').select('*');
                if (data) allProducts = data;
            } catch (e) { console.error(e) }

            // JS FUZZY MATCH LOGIC
            // Target: seg2 (e.g. "en-ucuz-apple-iphone-15-pro-1-tb-fiyati")
            let searchSlug = seg2.replace(/^en-ucuz-/, '').replace(/-fiyati$/, ''); // "apple-iphone-15-pro-1-tb"
            const searchTokens = searchSlug.split('-'); // ['apple', 'iphone', '15', 'pro', '1', 'tb']

            const scoredProducts = allProducts.map(p => {
                let score = 0;
                const pName = (p.name || '').toLowerCase();
                const pSlug = (p.slug || '').toLowerCase();

                // Exact Slug Match (Highest Priority)
                if (pSlug === searchSlug) return { p, score: 1000 };

                // Token Match in Name
                searchTokens.forEach(token => {
                    if (pName.includes(token)) score += 10;
                });

                // Deduct for length mismatch (penalize completely different products)
                // e.g. "Pro" vs "Pro Max" - length diff matters? 
                // Simplified: Just use token overlap count.

                return { p, score };
            });

            // Sort by score
            scoredProducts.sort((a, b) => b.score - a.score);
            const bestMatch = scoredProducts.length > 0 ? scoredProducts[0] : null;

            if (bestMatch && bestMatch.score > 20) { // Threshold: at least 2 tokens matched
                // Found Product!
                const fakeParams = {
                    category: 'elektronik', // TODO: dynamic
                    subcategory: seg1,
                    productId: bestMatch.p.slug || bestMatch.p.id
                };
                return <ProductDetailView params={fakeParams} initialProduct={bestMatch.p} category="elektronik" />;
            } else {
                // Fallback: If no good match, return DEBUG Info or NotFound
                // Using ClientKiyasGo here might be why user saw the list view!
                // Let's return a clean "Product Not Found" view to separate issues.
                return (
                    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-800 p-4">
                        <h1 className="text-2xl font-bold mb-4">Ürün Bulunamadı :(</h1>
                        <div className="bg-white p-4 rounded shadow text-sm font-mono border border-slate-200">
                            <p className="font-bold border-b pb-2 mb-2">Debug Bilgisi:</p>
                            <p>URL Segment 1: {seg1}</p>
                            <p>URL Segment 2: {seg2}</p>
                            <p>Processed Search: {searchSlug}</p>
                            <p>Best Match (Score {bestMatch?.score}): {bestMatch?.p?.name || 'None'}</p>
                            <p>Threshold: 20</p>
                        </div>
                        <a href="/" className="mt-6 bg-indigo-600 text-white px-4 py-2 rounded-lg">Anasayfaya Dön</a>
                    </div>
                );
            }
        }
    }

    return notFound();
}
