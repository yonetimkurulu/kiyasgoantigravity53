
import React from 'react';
import { createClient } from '@/app/utils/supabase/client';
import SearchResults from '@/app/components/SearchResults';
import { PRODUCTS_DATA, generatePrices } from '@/app/data';

export const dynamic = 'force-dynamic';

export default async function SearchPage() {
    // 1. Fetch Live Data on Server
    const supabase = createClient();
    let allProducts = [...PRODUCTS_DATA]; // Start with static

    try {
        const { data, error } = await supabase.from('products').select('*');
        if (data && !error && data.length > 0) {
            // Merge/Overwrite with Live Data logic similar to ClientKiyasGo
            allProducts = data.map(live => ({
                ...live,
                id: live.slug || live.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, ''),
                image: live.image || live.image1 || "https://example.com/placeholder.jpg",
                desc: live.desc || 'Ürün açıklaması yakında eklenecek.',
                rating: live.rating || 4.5,
                category: live.category || 'elektronik',
                subcategory: (live.subcategory || 'cep-telefonu').toLowerCase().trim().replace(/ /g, '-'),
                prices: live.stores || generatePrices(live.price || 0),
                price: live.price || 0,
            }));
        }
    } catch (e) {
        console.error("Search fetch error:", e);
    }

    return (
        <SearchResults allProducts={allProducts} />
    );
}
