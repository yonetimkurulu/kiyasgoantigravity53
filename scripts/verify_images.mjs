
import { PRODUCTS_DATA } from '../app/data.js';
import https from 'https';
import http from 'http';

const checkUrl = (url) => {
    return new Promise((resolve) => {
        if (!url || !url.startsWith('http')) {
            resolve({ url, status: 'INVALID', ok: false });
            return;
        }

        const client = url.startsWith('https') ? https : http;
        const req = client.request(url, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            resolve({ url, status: res.statusCode, ok: res.statusCode >= 200 && res.statusCode < 400 });
        });

        req.on('error', () => {
            // Try GET if HEAD fails
            const req2 = client.request(url, { method: 'GET', headers: { 'User-Agent': 'Mozilla/5.0' } }, (res2) => {
                // Abort immediately, we just want status
                res2.destroy();
                resolve({ url, status: res2.statusCode, ok: res2.statusCode >= 200 && res2.statusCode < 400 });
            });
            req2.on('error', (err) => resolve({ url, status: 'ERROR', ok: false, err: err.message }));
            req2.end();
        });

        req.end();
    });
};

async function checkAll() {
    console.log(`Checking ${PRODUCTS_DATA.length} images...`);
    let broken = 0;

    // Check in batches of 10
    for (let i = 0; i < PRODUCTS_DATA.length; i += 10) {
        const batch = PRODUCTS_DATA.slice(i, i + 10);
        const results = await Promise.all(batch.map(async (p) => {
            const res = await checkUrl(p.image);
            return { id: p.id, ...res };
        }));

        results.forEach(r => {
            if (!r.ok) {
                console.log(`[BROKEN] ${r.id}: ${r.status} - ${r.url}`);
                broken++;
            } else {
                // console.log(`[OK] ${r.id}`);
            }
        });
    }

    console.log(`\nFound ${broken} broken images out of ${PRODUCTS_DATA.length}.`);
}

checkAll();
