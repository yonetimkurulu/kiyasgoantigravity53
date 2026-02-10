
import React from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@/app/utils/supabase/server';
import { PRODUCTS_DATA, POPULAR_BRANDS, generatePrices } from '@/app/data';
import BrandPageClient from '@/app/components/BrandPageClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
    const brandSlug = (await params).slug;
    const brand = POPULAR_BRANDS.find(b => b.id === brandSlug);

    if (!brand) return { title: 'Marka Bulunamadı - KıyasGO' };

    return {
        title: `${brand.name} Fiyatları ve Modelleri - KıyasGO`,
        description: `${brand.name} marka tüm ürünler, en ucuz fiyatlar ve modeller KıyasGO'da.`,
    };
}

export default async function BrandPage({ params }) {
    const brandSlug = (await params).slug;
    const brand = POPULAR_BRANDS.find(b => b.id === brandSlug);

    if (!brand) {
        notFound();
    }

    // 1. Fetch Live Data on Server
    const supabase = await createClient();
    let allProducts = [...PRODUCTS_DATA];

    try {
        const { data, error } = await supabase.from('products').select('*');
        if (data && !error && data.length > 0) {
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
        console.error("Brand page fetch error:", e);
    }

    // 2. Filter Products by Brand
    // Normalize brand name for robust matching (e.g. 'Apple' vs 'apple')
    const brandProducts = allProducts.filter(p => {
        const pName = p.name ? p.name.toLowerCase() : '';
        const bName = brand.name.toLowerCase();
        return pName.includes(bName);
    });

    return (
        <BrandPageClient brand={brand} products={brandProducts} />
    );
}
