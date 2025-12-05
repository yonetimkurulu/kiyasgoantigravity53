
import https from 'https';

const patterns = [
    "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-pro.jpg",
    "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-ultra.jpg",
    "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-ultra-5g-sm-s928.jpg",
    "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-14-pro.jpg",
    "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-14.jpg",
    "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-fold5.jpg",
];

const checkUrl = (url) => {
    return new Promise((resolve) => {
        const req = https.request(url, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            resolve({ url, status: res.statusCode, ok: res.statusCode >= 200 && res.statusCode < 400 });
        });
        req.on('error', () => resolve({ url, status: 'ERR', ok: false }));
        req.end();
    });
};

async function test() {
    for (const p of patterns) {
        const res = await checkUrl(p);
        console.log(`${res.status} - ${res.url}`);
    }
}

test();
