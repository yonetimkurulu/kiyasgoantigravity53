const axios = require('axios');
const cheerio = require('cheerio');

const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
];

async function scrapeCimri(query) {
    const ua = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
    const delay = Math.floor(Math.random() * 700) + 200;
    await new Promise(r => setTimeout(r, delay));

    try {
        const url = `https://www.cimri.com/arama?q=${encodeURIComponent(query)}`;
        const response = await axios.get(url, {
            headers: { 'User-Agent': ua, 'Accept-Language': 'tr-TR' }
        });

        const $ = cheerio.load(response.data);
        // Selectors might need updating based on real cimri DOM
        const item = $('#cimri-product-list-container li').first();

        if (item.length === 0) return null;

        // Simplified extraction guess
        const priceText = item.find('div[class*="Price"]').text();
        const price = parseFloat(priceText.replace(/[^0-9,]/g, '').replace(',', '.'));

        const image_url = item.find('img').attr('src');

        return {
            price: isNaN(price) ? null : price,
            image_url: image_url,
            source_link: url
        };

    } catch (error) {
        return null;
    }
}

module.exports = scrapeCimri;
