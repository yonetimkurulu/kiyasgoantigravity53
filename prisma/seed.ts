import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PRODUCTS_DATA = [
    { id: "iphone-15-pro", name: "iPhone 15 Pro", category: "elektronik", price: 75000, image: "📱", desc: "Titanyum tasarım, A17 Pro çip.", rating: 4.8 },
    { id: "samsung-s24-ultra", name: "Samsung S24 Ultra", category: "elektronik", price: 72000, image: "📱", desc: "Galaxy AI özellikleri, 200MP kamera.", rating: 4.7 },
    { id: "dyson-v15", name: "Dyson V15", category: "ev-yasam", price: 25000, image: "🧹", desc: "Lazer teknolojili kablosuz süpürge.", rating: 4.9 },
    { id: "nike-air-max", name: "Nike Air Max", category: "moda", price: 4500, image: "👟", desc: "Günlük kullanım için ikonik tasarım.", rating: 4.5 },
    { id: "sony-wh-1000xm5", name: "Sony WH-1000XM5", category: "elektronik", price: 12000, image: "🎧", desc: "Endüstri lideri gürültü engelleme.", rating: 4.6 },
    { id: "zara-blazer", name: "Zara Blazer Ceket", category: "moda", price: 3200, image: "🧥", desc: "Ofis şıklığı için modern kesim.", rating: 4.3 },
    { id: "philips-airfryer", name: "Philips Airfryer XXL", category: "ev-yasam", price: 8500, image: "🍟", desc: "Az yağ ile çıtır lezzetler.", rating: 4.8 },
    { id: "macbook-air-m2", name: "MacBook Air M2", category: "elektronik", price: 42000, image: "💻", desc: "İnce, hafif ve güçlü M2 işlemci.", rating: 4.9 },
];

const SELLERS = [
    { name: "Trendyol", domain: "trendyol.com", logo: "https://cdn.dsmcdn.com/web/logo/ty-web.svg", trust: 9.5 },
    { name: "Hepsiburada", domain: "hepsiburada.com", logo: "https://images.hepsiburada.net/assets/s/logo/hepsiburada.svg", trust: 9.2 },
    { name: "Amazon", domain: "amazon.com.tr", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg", trust: 9.8 },
    { name: "N11", domain: "n11.com", logo: "https://n11scdn.akamaized.net/a1/org/logo_n11.svg", trust: 8.5 },
    { name: "MediaMarkt", domain: "mediamarkt.com.tr", logo: "https://upload.wikimedia.org/wikipedia/commons/2/29/Media_Markt_logo.svg", trust: 9.0 },
];

async function main() {
    console.log('Seeding database...');

    // Create Sellers
    const sellerRecords = [];
    for (const s of SELLERS) {
        const seller = await prisma.seller.upsert({
            where: { name: s.name },
            update: {},
            create: {
                name: s.name,
                domain: s.domain,
                logoUrl: s.logo,
                trustScore: s.trust,
            },
        });
        sellerRecords.push(seller);
    }

    // Create Products and Prices
    for (const p of PRODUCTS_DATA) {
        const product = await prisma.product.upsert({
            where: { slug: p.id },
            update: {},
            create: {
                name: p.name,
                slug: p.id,
                category: p.category,
                description: p.desc,
                imageUrl: p.image, // Using emoji as image for now as per existing code
                specs: { rating: p.rating },
            },
        });

        // Create Prices for each product
        for (const seller of sellerRecords) {
            // Random price variation
            const variance = (Math.random() * 0.2) - 0.1; // +/- 10%
            const price = Math.round(p.price * (1 + variance));

            await prisma.price.upsert({
                where: {
                    productId_sellerId: {
                        productId: product.id,
                        sellerId: seller.id,
                    },
                },
                update: {},
                create: {
                    productId: product.id,
                    sellerId: seller.id,
                    price: price,
                    currency: "TRY",
                    url: `https://${seller.domain}/search?q=${p.id}`,
                },
            });

            // Create some history
            await prisma.priceHistory.create({
                data: {
                    productId: product.id,
                    price: price,
                    date: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30), // Random date in last 30 days
                },
            });
        }
    }

    console.log('Seeding finished.');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
