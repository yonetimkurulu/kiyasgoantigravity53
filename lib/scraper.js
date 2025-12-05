
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

        // 9. Ekstra Fotoğraflar (Lifestyle)
        let images = [];
        try {
            // URL yapısını değiştir: ...-123.php -> ...-pictures-123.php
            // Örnek: https://www.gsmarena.com/samsung_galaxy_s24_ultra-12771.php
            // Hedef: https://www.gsmarena.com/samsung_galaxy_s24_ultra-pictures-12771.php

            const urlParts = url.split('-');
            const id = urlParts.pop(); // "12771.php"
            const baseUrl = urlParts.join('-'); // "https://www.gsmarena.com/samsung_galaxy_s24_ultra"
            const picturesUrl = `${baseUrl}-pictures-${id}`;

            console.log('Fetching pictures from:', picturesUrl);
            const { data: picsData } = await axios.get(picturesUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

            const $pics = cheerio.load(picsData);

            // "Official photos" veya "Our photos" bölümünü bul
            // Genellikle #pictures-list img etiketi altındalar
            $pics('#pictures-list img').each((i, el) => {
                if (images.length >= 5) return false; // 5 tane yeterli

                const src = $pics(el).attr('src');
                // Sadece büyük resimleri alalım (bazen thumb olabilir, src kontrolü)
                if (src && !src.includes('thumb')) {
                    images.push(src);
                } else if (src) {
                    // Eğer thumb ise orijinalini bulmaya çalışalım (genellikle URL pattern değişir)
                    // GSM Arena'da bazen src=".../thumbs/..." olur, bunu silersek orijinali gelir mi?
                    // Genellikle: https://fdn.gsmarena.com/imgroot/reviews/24/samsung-galaxy-s24-ultra/lifestyle/-1024w2/gsmarena_001.jpg
                    // Thumb: https://fdn.gsmarena.com/imgroot/reviews/24/samsung-galaxy-s24-ultra/lifestyle/-344x215/gsmarena_001.jpg
                    const original = src.replace('thumbs/', '').replace(/-[0-9]+x[0-9]+/, '-1024w2');
                    // Riskli olabilir, direkt src alalım şimdilik veya thumb olmayanları filtreleyelim
                    images.push(src.replace('thumbs', 'best')); // Deneme
                }
            });

            // Eğer "Our photos" (lifestyle) yoksa, official images'a fallback yapalım
            if (images.length === 0) {
                $pics('img').each((i, el) => {
                    const src = $pics(el).attr('src');
                    if (images.length < 5 && src && src.includes('gsmarena_') && !src.includes('thumb')) {
                        images.push(src);
                    }
                });
            }

        } catch (e) {
            console.warn('Ekstra fotoğraflar çekilemedi:', e.message);
        }

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
            url,
            images // Yeni alan
        };

    } catch (error) {
        console.error('Scraping hatası:', error.message);
        throw new Error('GSM Arena verisi çekilemedi.');
    }
}
