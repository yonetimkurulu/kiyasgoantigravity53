
import fs from 'fs';
import path from 'path';

// Manual map for specific popular products to ensure they look correct
const MANUAL_IMAGES = {
    // Phones (GSMArena)
    "iphone-15-pro": "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-pro.jpg",
    "samsung-galaxy-s24-ultra": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-ultra-5g-sm-s928.jpg",
    "iphone-15": "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15.jpg",
    "samsung-galaxy-s24-plus": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-plus-5g-sm-s926.jpg",
    "xiaomi-14-pro": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-14-pro.jpg",
    "samsung-galaxy-a55": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a55.jpg",
    "iphone-14": "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-14.jpg",
    "samsung-galaxy-z-fold5": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-fold5.jpg",
    "xiaomi-redmi-note-13-pro": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-13-pro.jpg",
    "oppo-reno-11-pro": "https://fdn2.gsmarena.com/vv/bigpic/oppo-reno11-pro.jpg",
    "samsung-galaxy-s23-fe": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s23-fe.jpg",
    "iphone-13": "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-13.jpg",
    "xiaomi-poco-x6-pro": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-x6-pro.jpg",
    "samsung-galaxy-a35": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a35.jpg",
    "iphone-se-3": "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-se-2022.jpg",
    "vivo-v30-pro": "https://fdn2.gsmarena.com/vv/bigpic/vivo-v30-pro.jpg",
    "samsung-galaxy-z-flip5": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-flip5.jpg",
    "xiaomi-13t-pro": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-13t-pro.jpg",
    "oppo-a78": "https://fdn2.gsmarena.com/vv/bigpic/oppo-a78-5g.jpg", // Guess
    "samsung-galaxy-m55": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m55.jpg",

    // Tablets
    "ipad-pro-m4": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=1000",
    "samsung-galaxy-tab-s9-ultra": "https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?q=80&w=1000",

    // Laptops
    "apple-macbook-air-m2": "https://images.unsplash.com/photo-1611186871348-64db9e8489c4?q=80&w=1000",
    "apple-macbook-pro-14-m3": "https://images.unsplash.com/photo-1517336714731-489689fd1ca4?q=80&w=1000",

    // Monitors
    "samsung-odyssey-g9": "https://images.unsplash.com/photo-1527443224156-3127df5139d9?q=80&w=1000",
    "lg-oled-c3": "https://images.unsplash.com/photo-1509281373149-e957c629640d?q=80&w=1000"
};

// Reliable Category Placeholders (Unsplash)
const CATEGORY_DEFAULTS = {
    "televizyon": "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80&w=1000",
    "tablet": "https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?auto=format&fit=crop&q=80&w=1000",
    "laptop": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=1000",
    "akilli-saat": "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=1000",
    "bluetooth-kulaklik": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=1000",
    "dikey-supurge": "https://images.unsplash.com/photo-1558317374-a309d917a2fb?auto=format&fit=crop&q=80&w=1000",
    "robot-supurge": "https://images.unsplash.com/photo-1628122396347-19a98efb8b21?auto=format&fit=crop&q=80&w=1000",
    "kurutma-makinesi": "https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?auto=format&fit=crop&q=80&w=1000",
    "ekran-karti": "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=1000",
    "monitor": "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1000",
    "oyun-bilgisayari": "https://images.unsplash.com/photo-1603481588273-2f908a9a7a1b?auto=format&fit=crop&q=80&w=1000"
};

const dataPath = path.join(process.cwd(), 'app', 'data.js');
let content = fs.readFileSync(dataPath, 'utf8');

// Strategy: Iterate over known IDs and replacements
Object.entries(MANUAL_IMAGES).forEach(([id, url]) => {
    // Look for { "id": "iphone-15-pro", ... "image": "OLD_URL", ... }
    // Handles greedy match carefully. Matches everything between id and image key.
    const regex = new RegExp(`("id":\\s*"${id}",[\\s\\S]*?"image":\\s*")([^"]*)(")`, 'g');
    content = content.replace(regex, `$1${url}$2`);
});

// Now apply category defaults
Object.entries(CATEGORY_DEFAULTS).forEach(([subcategory, url]) => {
    // Regex to capture: "image": "...", ... "subcategory": "subcategory"
    // "image":\s*"...","[\s\S]*?"subcategory":\s*"cat"

    const regex = new RegExp(`("image":\\s*")([^"]*)("[\\s\\S]*?"subcategory":\\s*"${subcategory}")`, 'g');
    content = content.replace(regex, (match, prefix, currentUrl, suffix) => {
        // If current URL is already GSMArena or Unsplash (from Manual Map), keep it.
        if (currentUrl.includes('gsmarena.com') || currentUrl.includes('unsplash.com')) {
            return match;
        }
        return `${prefix}${url}${suffix}`;
    });
});

fs.writeFileSync(dataPath, content, 'utf8');
console.log('Successfully updated product images in app/data.js');
