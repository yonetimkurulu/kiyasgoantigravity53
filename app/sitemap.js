import { ELECTRONICS_SUBCATEGORIES, HOME_OFFICE_SUBCATEGORIES } from './data';

export default function sitemap() {
    const baseUrl = 'https://www.kiyasgo.com';

    // Static routes
    const routes = [
        '',
        '/kiyasgo-nedir',
        '/hakkimizda',
        '/gizlilik',
        '/kullanim',
        '/bize-ulasin',
        '/profil',
        '/arama',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: route === '' ? 1 : 0.8,
    }));

    // Dynamic Category routes
    const categoryRoutes = [];

    // Electronics
    ELECTRONICS_SUBCATEGORIES.forEach(cat => {
        categoryRoutes.push({
            url: `${baseUrl}/${cat.id}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
        });
        // Add subcategories if any
        if (cat.children) {
            cat.children.forEach(sub => {
                categoryRoutes.push({
                    url: `${baseUrl}/${sub.id}`,
                    lastModified: new Date(),
                    changeFrequency: 'weekly',
                    priority: 0.6,
                });
            })
        }
    });

    // Home & Office
    HOME_OFFICE_SUBCATEGORIES.forEach(cat => {
        categoryRoutes.push({
            url: `${baseUrl}/${cat.id}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
        });
        // Add subcategories if any
        if (cat.children) {
            cat.children.forEach(sub => {
                categoryRoutes.push({
                    url: `${baseUrl}/${sub.id}`,
                    lastModified: new Date(),
                    changeFrequency: 'weekly',
                    priority: 0.6,
                });
            })
        }
    });

    return [...routes, ...categoryRoutes];
}
