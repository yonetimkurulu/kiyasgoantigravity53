const axios = require('axios');
const cheerio = require('cheerio');

const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
];

async function scrapeAkakce(query) {
    const ua = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
    const delay = Math.floor(Math.random() * 700) + 200;
    await new Promise(r => setTimeout(r, delay));

    try {
        const url = `https://www.akakce.com/arama/?q=${encodeURIComponent(query)}`;
        const response = await axios.get(url, {
            headers: {
                'User-Agent': ua,
                'Accept-Language': 'tr-TR'
            }
        });

        const $ = cheerio.load(response.data);
        const item = $('.p-list li').first();

        if (item.length === 0) return null;

        const priceText = item.find('.pt_v8').text().trim();
        const price = parseFloat(priceText.replace(/[^0-9,]/g, '').replace(',', '.'));

        let image_url = item.find('img').attr('src');
        if (image_url && !image_url.startsWith('http')) image_url = `https:${image_url}`;

        const linkSuffix = item.find('a').attr('href');
        const source_link = linkSuffix ? `https://www.akakce.com${linkSuffix}` : url;

        return {
            price: isNaN(price) ? null : price,
            image_url,
            source_link
        };

    } catch (error) {
        // console.error(`Akakce Scrape Error (${query}):`, error.message);
        return null;
    }
}

module.exports = scrapeAkakce;
