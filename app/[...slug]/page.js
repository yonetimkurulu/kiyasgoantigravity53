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

            const bestMatch = scoredProducts.length > 0 ? scoredProducts[0] : null;

            // Strict Model Check Helper
            const checkModelMismatch = (prodName, urlTokens) => {
                const pLower = prodName.toLowerCase();
                const keywords = ['pro', 'max', 'plus', 'ultra', 'mini', 'air', 'fe', 'lite', 'se', 'm2', 'm3', 'm1'];

                for (const kw of keywords) {
                    // Check if URL explicitly asked for this keyword
                    const urlHasKw = urlTokens.includes(kw);
                    // Check if Product Name has this keyword
                    const prodHasKw = new RegExp(`\\b${kw}\\b`, 'i').test(pLower);

                    // If URL asks for "Pro" and Product is NOT "Pro" -> Mismatch
                    // If URL does NOT ask for "Pro" but Product IS "Pro" -> Mismatch (e.g. "iPhone 15" shouldn't open "iPhone 15 Pro")
                    if (urlHasKw !== prodHasKw) return true;
                }
                return false;
            };

            const scoredProductsFiltered = allProducts.map(p => {
                let score = 0;
                const pName = (p.name || '').toLowerCase();
                const pSlug = (p.slug || '').toLowerCase();

                // 1. Exact Slug Match (Highest Priority)
                if (pSlug === searchSlug) return { p, score: 9999 };

                // 2. Strict Model Mismatch (Instant Fail)
                if (checkModelMismatch(pName, searchTokens)) return { p, score: -1 };

                // 3. Token Match
                searchTokens.forEach(token => {
                    // Only count meaningful tokens (skip 'gb', 'fiyati', generic stuff if needed)
                    if (pName.includes(token)) score += 10;
                });

                // Bonus for exact token count match?
                return { p, score };
            }).filter(item => item.score > 0).sort((a, b) => b.score - a.score);

            const finalBestMatch = scoredProductsFiltered.length > 0 ? scoredProductsFiltered[0] : null;

            if (finalBestMatch && finalBestMatch.score > 20) { // Threshold: at least 2 tokens matched
                // Found Product!
                const fakeParams = {
                    category: 'elektronik', // TODO: dynamic
                    subcategory: seg1,
                    productId: finalBestMatch.p.slug || finalBestMatch.p.id
                };
                return <ProductDetailView params={fakeParams} initialProduct={finalBestMatch.p} category="elektronik" />;
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
                            <p>Best Match (Score {finalBestMatch?.score}): {finalBestMatch?.p?.name || 'None'}</p>
                            <p>Threshold: 20</p>
                        </div>
                        <a href="/" className="mt-6 bg-indigo-600 text-white px-4 py-2 rounded-lg">Anasayfaya Dön</a>
                    </div>
                );
            }
        }

        return notFound();
    }
}
