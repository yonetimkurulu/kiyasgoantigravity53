
import fs from 'fs';
import path from 'path';

// Map of IDs to NEW, VALID URLs
const REPLACEMENTS = {
    // Phone Fixes (GSMArena naming guesses)
    "oppo-reno-11-pro": "https://fdn2.gsmarena.com/vv/bigpic/oppo-reno11-pro-5g.jpg", // Try 5G suffix
    "oppo-a78": "https://fdn2.gsmarena.com/vv/bigpic/oppo-a78.jpg", // Try without 5g
    "xiaomi-13t-pro-dup": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-13t-pro.jpg", // Use GSMArena instead of forbidden official site

    // TV Fixes
    "samsung-qled-qn90c": "https://images.samsung.com/is/image/samsung/p6pim/tr/qe65qn90catxtk/gallery/tr-qled-tv-qn90c-qe65qn90catxtk-536453959?$684_547_PNG$", // Generic Samsung TV
    "lg-oled-c3": "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&q=80&w=1000", // Working TV image

    // Laptop Fixes (Unsplash)
    "apple-macbook-air-m2": "https://images.unsplash.com/photo-1517336714731-489689fd1ca4?auto=format&fit=crop&q=80&w=1000",
    "apple-macbook-pro-14-m3": "https://images.unsplash.com/photo-1517336714731-489689fd1ca4?auto=format&fit=crop&q=80&w=1000",

    // Other
    "bosch-serie-4-wtw875w1tr": "https://media3.bsh-group.com/Product_Shots/1600x900/MCSA00753086_WTW85410TR_def.jpg" // Similar model
};

const dataPath = path.join(process.cwd(), 'app', 'data.js');
let content = fs.readFileSync(dataPath, 'utf8');

Object.entries(REPLACEMENTS).forEach(([id, url]) => {
    // Regex matches: "id": "ID", ... "image": "OLD_URL",
    // We replace OLD_URL with NEW_URL.
    // Be careful with the comma or closing quote.
    // The previous fix ensures we have "image": "URL", syntax.

    const regex = new RegExp(`("id":\\s*"${id}",[\\s\\S]*?"image":\\s*")([^"]*)(")`, 'g');
    if (regex.test(content)) {
        content = content.replace(regex, `$1${url}$3`);
        console.log(`Updated ${id}`);
    } else {
        console.log(`Could not find ${id}`);
    }
});

fs.writeFileSync(dataPath, content, 'utf8');
console.log('Finished polishing images.');
