
import { NextResponse } from 'next/server';
import { saveProduct } from '@/lib/saveProduct';

export const runtime = 'edge';

export async function GET(request: Request) {
    const top_phones = [
        'iPhone 15 Pro',
        'Samsung Galaxy S24 Ultra',
        'iPhone 14',
        'Samsung Galaxy A55',
        'Redmi Note 13 Pro',
        'Poco X6 Pro',
        'iPhone 13',
        'Samsung Galaxy S23 FE',
        'Dyson Gen5detect' // Added a non-phone for variety as per user context
    ];

    const results = [];

    // Determine Base URL for internal API call
    // Request.url gives the full URL, we can parse origin.
    const { origin } = new URL(request.url);

    for (const query of top_phones) {
        try {
            console.log(`Processing: ${query}`);

            // Call our own Akakçe Scraper API
            const scrapeUrl = `${origin}/api/akakce?q=${encodeURIComponent(query)}`;
            const res = await fetch(scrapeUrl);

            if (!res.ok) {
                results.push({ query, status: 'failed', error: `Scraper API error: ${res.status}` });
                continue;
            }

            const productData = await res.json();

            // Save to Supabase
            const saveResult = await saveProduct(productData);

            results.push({
                query,
                status: saveResult.success ? 'success' : 'failed',
                data: saveResult.success ? saveResult.product : saveResult.error
            });

        } catch (error) {
            console.error(`Error processing ${query}:`, error);
            results.push({ query, status: 'error', details: error instanceof Error ? error.message : 'Unknown' });
        }
    }

    return NextResponse.json({
        success: true,
        timestamp: new Date().toISOString(),
        results
    });
}
