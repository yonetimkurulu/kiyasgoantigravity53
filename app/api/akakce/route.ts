
import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const runtime = 'edge';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');

        if (!query) {
            return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
        }

        // Akakçe search URL
        const searchUrl = `https://www.akakce.com/arama/?q=${encodeURIComponent(query)}`;

        // User-Agent is crucial for scraping
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
        };

        const response = await fetch(searchUrl, { headers });

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to fetch Akakce' }, { status: response.status });
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // Selector strategy for the first product in search results list
        // Akakçe usually lists products in a specific list structure. 
        // Common selector: .p-list li OR .products li
        // We aim for the first item.

        // Attempt 1: Standard Search List
        let firstItem = $('.p-list li').first();

        // If not found, try alternative layout (sometimes grid)
        if (firstItem.length === 0) {
            firstItem = $('#CList li').first();
        }

        if (firstItem.length === 0) {
            return NextResponse.json({ error: 'No products found' }, { status: 404 });
        }

        // Extract Data
        // Title is usually in <h3> or a link with class 'p-name' or 'pn_v8'
        const title = firstItem.find('h3.pn_v8').text().trim() || firstItem.find('.pt_v8').text().trim() || firstItem.find('a').attr('title') || 'Unknown Product';

        // Link
        const relativeLink = firstItem.find('a').attr('href');
        const link = relativeLink ? `https://www.akakce.com${relativeLink}` : null;

        // Image
        // Akakçe uses lazy loading often, look for data-src or src
        const imgTag = firstItem.find('img');
        let imgSrc = imgTag.attr('data-src') || imgTag.attr('src');
        if (imgSrc && imgSrc.startsWith('/')) {
            imgSrc = `https://www.akakce.com${imgSrc}`;
        }

        // Price
        // usually in .pt_v8 (span) or .price
        // format: "35.999 TL"
        const priceText = firstItem.find('.pt_v8').text().trim() || firstItem.find('.price').text().trim();

        // Extract numbers only
        const price = priceText ? parseFloat(priceText.replace(/[^0-9,]/g, '').replace(',', '.')) : 0;

        const data = {
            title,
            price,
            image: imgSrc || null,
            link,
            source: 'akakce'
        };

        return NextResponse.json(data);

    } catch (error) {
        console.error('Scraping error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 });
    }
}
