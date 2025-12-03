import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const id = params.id;

    try {
        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                prices: {
                    include: {
                        seller: true,
                    },
                    orderBy: {
                        price: 'asc',
                    },
                },
                priceHistory: {
                    orderBy: {
                        date: 'desc',
                    },
                    take: 30, // Son 30 gün
                },
            },
        });

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
