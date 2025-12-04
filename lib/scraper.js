
import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * GSM Arena'dan telefon özelliklerini çeker.
 * @param {string} url - GSM Arena model URL'si
 * @returns {Promise<Object>} - Telefon verileri
 */
export async function scrapeGsmArena(url) {
    try {
        // GSM Arena'ya istek at (User-Agent eklemek önemli olabilir)
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const $ = cheerio.load(data);

        // 1. Telefon Adı
        const name = $('h1.specs-phone-name-title').text().trim();

        // 2. Kapak Fotoğrafı
        const image = $('.specs-photo-main img').attr('src');

        // 3. Ekran
        const displayType = $('[data-spec="displaytype"]').text().trim();
        const displaySize = $('[data-spec="displaysize"]').text().trim();
        const displayRes = $('[data-spec="displayresolution"]').text().trim();
        const display = `${displayType}, ${displaySize}, ${displayRes}`;

        // 4. Hafıza (RAM ve Depolama)
        // Örnek: "256GB 12GB RAM, 512GB 12GB RAM, 1TB 12GB RAM"
        const memoryString = $('[data-spec="internalmemory"]').text().trim();
        const memoryOptions = memoryString.split(',').map(s => s.trim());

        const storageOptions = [];
        const ramOptions = [];

        memoryOptions.forEach(opt => {
            // Basit bir regex ile ayırmaya çalışalım
            const parts = opt.split(' ');
            // Genellikle ilk kısım depolama, son kısım RAM olur ama her zaman değil.
            // Örn: 256GB 12GB RAM
            const storage = parts[0];
            const ram = parts.slice(1).join(' ').replace('RAM', '').trim();

            if (storage && !storageOptions.includes(storage)) storageOptions.push(storage);
            if (ram && !ramOptions.includes(ram)) ramOptions.push(ram);
        });

        // 5. Kamera
        // Main Camera
        const mainCamera = $('[data-spec="cam1modules"]').text().trim().replace(/\n/g, ' ').replace(/\s+/g, ' ');
        // Selfie Camera
        const selfieCamera = $('[data-spec="cam2modules"]').text().trim().replace(/\n/g, ' ').replace(/\s+/g, ' ');
        const camera = `Main: ${mainCamera} | Selfie: ${selfieCamera}`;

        // 6. Batarya
        const battery = $('[data-spec="batdescription1"]').text().trim();

        // 7. Network
        const networks = [];
        if ($('.tr-toggle').text().includes('5G')) networks.push('5G');
        if ($('.tr-toggle').text().includes('4G') || $('.tr-toggle').text().includes('LTE')) networks.push('4G');
        if ($('.tr-toggle').text().includes('3G')) networks.push('3G');
        if ($('.tr-toggle').text().includes('GSM')) networks.push('2G');

        // 8. Fiyat
        const price = $('[data-spec="price"]').text().trim();

        return {
            name,
            image,
            display,
            storage: storageOptions,
            ram: ramOptions,
            camera,
            battery,
            networks,
            price,
            url
        };

    } catch (error) {
        console.error('Scraping hatası:', error.message);
        throw new Error('GSM Arena verisi çekilemedi.');
    }
}
