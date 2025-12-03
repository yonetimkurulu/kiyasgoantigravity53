import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    // 1. Security Check
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.SCRAPER_SECRET_KEY}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { name, slug, imageUrl, prices, specs } = body;

        // 2. Upsert Product
        const product = await prisma.product.upsert({
            where: { slug },
            update: {
                name,
                imageUrl,
                specs,
            },
            create: {
                name,
                slug,
                imageUrl,
                specs,
            },
        });

        // 3. Update Prices
        for (const p of prices) {
            // Find or create seller
            const seller = await prisma.seller.upsert({
                where: { name: p.sellerName },
                update: {
                    domain: p.sellerDomain,
                    logoUrl: p.sellerLogo,
                },
                create: {
                    name: p.sellerName,
                    domain: p.sellerDomain,
                    logoUrl: p.sellerLogo,
                },
            });

            // Upsert Price
            await prisma.price.upsert({
                where: {
                    productId_sellerId: {
                        productId: product.id,
                        sellerId: seller.id,
                    },
                },
                update: {
                    price: p.price,
                    url: p.url,
                    lastUpdated: new Date(),
                },
                create: {
                    productId: product.id,
                    sellerId: seller.id,
                    price: p.price,
                    url: p.url,
                    currency: 'TRY',
                },
            });
        }

        // 4. Log History (Best Price)
        if (prices.length > 0) {
            const bestPrice = Math.min(...prices.map((p: any) => p.price));
            await prisma.priceHistory.create({
                data: {
                    productId: product.id,
                    price: bestPrice,
                },
            });
        }

        return NextResponse.json({ success: true, productId: product.id });
    } catch (error) {
        console.error('Scrape webhook error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
