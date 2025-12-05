
import React from 'react';

export const generatePrices = (basePrice) => [
    { store: "Trendyol", price: basePrice, color: "text-orange-600 dark:text-orange-400" },
    { store: "Hepsiburada", price: basePrice - 500, color: "text-orange-500 dark:text-orange-300" },
    { store: "Amazon", price: basePrice + 250, color: "text-yellow-600 dark:text-yellow-400" },
    { store: "N11", price: basePrice + 100, color: "text-purple-600 dark:text-purple-400" },
    { store: "MediaMarkt", price: basePrice + 1000, color: "text-red-600 dark:text-red-400" },
];

export const ELECTRONICS_SUBCATEGORIES = [
    { id: "cep-telefonu", label: "Cep Telefonu", icon: "📱", image: "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro.jpg" },
    { id: "televizyon", label: "Televizyon", icon: "📺", image: "https://images.samsung.com/is/image/samsung/p6pim/tr/qe55s95catxtk/gallery/tr-oled-s95c-qe55s95catxtk-536442653?$684_547_PNG$" },
    { id: "monitor", label: "Monitör", icon: "🖥️", image: "https://images.samsung.com/is/image/samsung/p6pim/tr/ls49cg954suxuf/gallery/tr-odyssey-oled-g9-g95sc-ls49cg954suxuf-537064805?$684_547_PNG$" },
    { id: "bluetooth-kulaklik", label: "Bluetooth Kulaklık", icon: "🎧", image: "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/MQD83?wid=1144&hei=1144&fmt=jpeg&qlt=95&.v=1660803972361" },
    { id: "ekran-karti", label: "Ekran Kartı", icon: "🎮", image: "https://asset.msi.com/resize/image/global/product/vga/GeForce-RTX-4090-GAMING-X-TRIO-24G-1.png624053898624053898/600.png" },
    { id: "dikey-supurge", label: "Dikey Süpürge", icon: "🧹", image: "https://dyson-h.assetsadobe2.com/is/image/content/dam/dyson/products/vacuum-cleaners/cordless/gen5/sv23/pdp/colourway-images/Gen5-Prussian-Blue-Copper-LB.png?scl=1&fmt=png-alpha" },
    { id: "tablet", label: "Tablet", icon: "📟", image: "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/ipad-pro-model-select-gallery-2-202405?wid=5120&hei=2880&fmt=p-jpg&qlt=95&.v=1713935742511" },
    { id: "laptop", label: "Laptop ve Notebook", icon: "💻", image: "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/macbook-air-midnight-select-20220606?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1653084303666" },
    { id: "oyun-bilgisayari", label: "Oyun Bilgisayarı", icon: "🕹️", image: "https://asset.msi.com/resize/image/global/product/notebook/GE78-HX-13V-Black-20221213.png624053898624053898/600.png" },
    { id: "robot-supurge", label: "Robot Süpürge", icon: "🤖", image: "https://images-na.ssl-images-amazon.com/images/I/61k1K-jXW+L._AC_SL1500_.jpg" },
    { id: "akilli-saat", label: "Akıllı Saat", icon: "⌚", image: "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/watch-ultra2-digitalmat-gallery-1-202409?wid=728&hei=666&fmt=png-alpha&.v=1725062630324" },
    { id: "kurutma-makinesi", label: "Kurutma Makinesi", icon: "🧺", image: "https://media3.bsh-group.com/Product_Shots/1600x900/MCSA02652683_WQ41G200TR_def.jpg" },
];

export const PRODUCTS_DATA = [
    // --- CEP TELEFONLARI ---
    {
        "id": "iphone-15-pro",
        "name": "Apple iPhone 15 Pro",
        "price": 89999,
        "image": "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-7inch?wid=5120&hei=2880&fmt=webp&qlt=70&.v=1693009279096",
        "desc": "Titanyum tasarım ve A17 Pro çip.",
        "rating": 4.8,
        "category": "elektronik",
        "subcategory": "cep-telefonu",
        "prices": generatePrices(89999)
    },
    {
        "id": "samsung-galaxy-s24-ultra",
        "name": "Samsung Galaxy S24 Ultra",
        "price": 84999,
        "image": "https://images.samsung.com/tr/smartphones/galaxy-s24-ultra/images/galaxy-s24-ultra-highlights-kv.jpg",
        "desc": "Galaxy AI ile akıllı telefon deneyimi.",
        "rating": 4.7,
        "category": "elektronik",
        "subcategory": "cep-telefonu",
        "prices": generatePrices(84999)
    },
    {
        "id": "iphone-15",
        "name": "Apple iPhone 15",
        "price": 59999,
        "image": "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-15-finish-select-202309-6-1inch?wid=5120&hei=2880&fmt=webp&qlt=70&.v=1692923777972",
        "desc": "Dinamik Ada ve 48 MP ana kamera.",
        "rating": 4.6,
        "category": "elektronik",
        "subcategory": "cep-telefonu",
        "prices": generatePrices(59999)
    },
    {
        "id": "samsung-galaxy-s24-plus",
        "name": "Samsung Galaxy S24+",
        "price": 64999,
        "image": "https://images.samsung.com/tr/smartphones/galaxy-s24/images/galaxy-s24-highlights-kv.jpg",
        "desc": "Güçlü performans ve uzun pil ömrü.",
        "rating": 4.5,
        "category": "elektronik",
        "subcategory": "cep-telefonu",
        "prices": generatePrices(64999)
    },
    {
        "id": "xiaomi-14-pro",
        "name": "Xiaomi 14 Pro",
        "price": 54999,
        "image": "https://i01.appmifile.com/webfile/globalimg/products/pc/xiaomi-14-pro/specs-header.png",
        "desc": "Leica kamera ve Snapdragon 8 Gen 3.",
        "rating": 4.6,
        "category": "elektronik",
        "subcategory": "cep-telefonu",
        "prices": generatePrices(54999)
    },
    {
        "id": "samsung-galaxy-a55",
        "name": "Samsung Galaxy A55 5G",
        "price": 22999,
        "image": "https://images.samsung.com/tr/smartphones/galaxy-a55/images/galaxy-a55-highlights-kv.jpg",
        "desc": "Dayanıklı tasarım ve harika kamera.",
        "rating": 4.4,
        "category": "elektronik",
        "subcategory": "cep-telefonu",
        "prices": generatePrices(22999)
    },
    {
        "id": "iphone-14",
        "name": "Apple iPhone 14",
        "price": 47999,
        "image": "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-14-finish-select-202209-6-1inch?wid=5120&hei=2880&fmt=webp&qlt=70&.v=1661026582322",
        "desc": "Çarpışma algılama ve harika pil.",
        "rating": 4.5,
        "category": "elektronik",
        "subcategory": "cep-telefonu",
        "prices": generatePrices(47999)
    },
    {
        "id": "samsung-galaxy-z-fold5",
        "name": "Samsung Galaxy Z Fold5",
        "price": 99999,
        "image": "https://images.samsung.com/tr/smartphones/galaxy-z-fold5/images/galaxy-z-fold5-highlights-kv.jpg",
        "desc": "Katlanabilir ekran ve çok yönlülük.",
        "rating": 4.7,
        "category": "elektronik",
        "subcategory": "cep-telefonu",
        "prices": generatePrices(99999)
    },
    {
        "id": "xiaomi-redmi-note-13-pro",
        "name": "Xiaomi Redmi Note 13 Pro+ 5G",
        "price": 24999,
        "image": "https://i01.appmifile.com/webfile/globalimg/products/pc/redmi-note-13-pro-plus/specs-header.png",
        "desc": "200 MP kamera ve hızlı şarj.",
        "rating": 4.5,
        "category": "elektronik",
        "subcategory": "cep-telefonu",
        "prices": generatePrices(24999)
    },
    {
        "id": "oppo-reno-11-pro",
        "name": "OPPO Reno11 Pro 5G",
        "price": 32999,
        "image": "https://image.oppo.com/content/dam/oppo/common/mkt/smartphone/reno11-pro-5g/reno11-pro-5g-pc.png",
        "desc": "Portre uzmanı ve şık tasarım.",
        "rating": 4.4,
        "category": "elektronik",
        "subcategory": "cep-telefonu",
        "prices": generatePrices(32999)
    },
    {
        "id": "samsung-galaxy-s23-fe",
        "name": "Samsung Galaxy S23 FE",
        "price": 29999,
        "image": "https://images.samsung.com/tr/smartphones/galaxy-s23-fe/images/galaxy-s23-fe-highlights-kv.jpg",
        "desc": "Fan Edition, harika değer.",
        "rating": 4.3,
        "category": "elektronik",
        "subcategory": "cep-telefonu",
        "prices": generatePrices(29999)
    },
    {
        "id": "iphone-13",
        "name": "Apple iPhone 13",
        "price": 39999,
        "image": "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-13-finish-select-202207?wid=5120&hei=2880&fmt=webp&qlt=70&.v=1657642504334",
        "desc": "Uzun pil ömrü ve güçlü çip.",
        "rating": 4.6,
        "category": "elektronik",
        "subcategory": "cep-telefonu",
        "prices": generatePrices(39999)
    },
    {
        "id": "xiaomi-poco-x6-pro",
        "name": "Xiaomi Poco X6 Pro 5G",
        "price": 18999,
        "image": "https://i01.appmifile.com/webfile/globalimg/products/pc/poco-x6-pro/specs-header.png",
        "desc": "Oyun performansı şampiyonu.",
        "rating": 4.4,
        "category": "elektronik",
        "subcategory": "cep-telefonu",
        "prices": generatePrices(18999)
    },
    {
        "id": "samsung-galaxy-a35",
        "name": "Samsung Galaxy A35 5G",
        "price": 16999,
        "image": "https://images.samsung.com/tr/smartphones/galaxy-a35/images/galaxy-a35-highlights-kv.jpg",
        "desc": "Güvenlik ve dayanıklılık ön planda.",
        "rating": 4.2,
        "category": "elektronik",
        "subcategory": "cep-telefonu",
        "prices": generatePrices(16999)
    },
    {
        "id": "iphone-se-3",
        "name": "Apple iPhone SE (3. Nesil)",
        "price": 21999,
        "image": "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-se-finish-select-202203?wid=5120&hei=2880&fmt=webp&qlt=70&.v=1646415846026",
        "desc": "Kompakt ve güçlü A15 çip.",
        "rating": 4.3,
        "category": "elektronik",
        "subcategory": "cep-telefonu",
        "prices": generatePrices(21999)
    },
    {
        "id": "vivo-v30-pro",
        "name": "vivo V30 Pro",
        "price": 34999,
        "image": "https://www.vivo.com/tr/product/v30pro/images/kv-pc.jpg",
        "desc": "Profesyonel seviye portre aydınlatma.",
        "rating": 4.5,
        "category": "elektronik",
        "subcategory": "cep-telefonu",
        "prices": generatePrices(34999)
    },
    {
        "id": "samsung-galaxy-z-flip5",
        "name": "Samsung Galaxy Z Flip5",
        "price": 64999,
        "image": "https://images.samsung.com/tr/smartphones/galaxy-z-flip5/images/galaxy-z-flip5-highlights-kv.jpg",
        "desc": "Cebine sığan katlanabilir.",
        "rating": 4.6,
        "category": "elektronik",
        "subcategory": "cep-telefonu",
        "prices": generatePrices(64999)
    },
    {
        "id": "xiaomi-13t-pro-dup",
        "name": "Xiaomi 13T Pro",
        "price": 34999,
        "image": "https://i01.appmifile.com/webfile/globalimg/products/pc/xiaomi-13t-pro/specs-header.png",
        "desc": "Leica işbirliği ve 120W şarj.",
        "rating": 4.5,
        "category": "elektronik",
        "subcategory": "cep-telefonu",
        "prices": generatePrices(34999)
    },
    {
        "id": "oppo-a78",
        "name": "OPPO A78 5G",
        "price": 13999,
        "image": "https://image.oppo.com/content/dam/oppo/common/mkt/smartphone/a78-5g/a78-5g-pc.png",
        "desc": "Uygun fiyatlı 5G deneyimi.",
        "rating": 4.1,
        "category": "elektronik",
        "subcategory": "cep-telefonu",
        "prices": generatePrices(13999)
    },
    {
        "id": "samsung-galaxy-m55",
        "name": "Samsung Galaxy M55 5G",
        "price": 18999,
        "image": "https://images.samsung.com/tr/smartphones/galaxy-m55/images/galaxy-m55-highlights-kv.jpg",
        "desc": "Büyük ekran ve uzun pil.",
        "rating": 4.3,
        "category": "elektronik",
        "subcategory": "cep-telefonu",
        "prices": generatePrices(18999)
    },

    // --- TELEVIZYON ---
    {
        "id": "samsung-qled-qn90c",
        "name": "Samsung 65\" QLED 4K QN90C Smart TV",
        "price": 54999,
        "image": "https://images.samsung.com/is/image/samsung/tr-qled-tv-qn65qn90catxxh-frontblack-533785928?$720_576_PNG$",
        "desc": "Muhteşem QLED görüntü ve Neo QLED teknolojisi.",
        "rating": 4.8,
        "category": "elektronik",
        "subcategory": "televizyon",
        "prices": generatePrices(54999)
    },
    {
        "id": "lg-oled-c3",
        "name": "LG 55\" OLED 4K evo C3 Smart TV",
        "price": 61999,
        "image": "https://www.lg.com/tr/images/televizyonlar/md07526980/gallery/OLED55C3PSA_350_D1.jpg",
        "desc": "Sonsuz kontrastlı OLED evo panel ve α9 işlemci.",
        "rating": 4.9,
        "category": "elektronik",
        "subcategory": "televizyon",
        "prices": generatePrices(61999)
    },
    {
        "id": "vestel-65u9500",
        "name": "Vestel 65\" 4K UHD Smart TV 65U9500",
        "price": 23999,
        "image": "https://productimages.vestel.com.tr/eb-65U9500_1_1680.jpg",
        "desc": "Yerli üretim, büyük ekran ve akıllı özellikler.",
        "rating": 4.3,
        "category": "elektronik",
        "subcategory": "televizyon",
        "prices": generatePrices(23999)
    },
    {
        "id": "philips-oled-808",
        "name": "Philips 55\" OLED+ 4K 808 Smart TV",
        "price": 58999,
        "image": "https://www.philips.com.tr/c-dam/b2c/tr_TR/experience_center/oledplus808/55OLED808_12_Front_Global.png",
        "desc": "Ambilight ve ses sistemi ile sürükleyici deneyim.",
        "rating": 4.7,
        "category": "elektronik",
        "subcategory": "televizyon",
        "prices": generatePrices(58999)
    },
    {
        "id": "samsung-crystal-4k-au8000",
        "name": "Samsung 55\" Crystal 4K AU8000 Smart TV",
        "price": 28999,
        "image": "https://images.samsung.com/is/image/samsung/tr-crystal-uhd-tv-ua55au8000uxxh-frontblack-308897227?$720_576_PNG$",
        "desc": "Crystal görüntü işlemci ve Dynamic Crystal Color.",
        "rating": 4.5,
        "category": "elektronik",
        "subcategory": "televizyon",
        "prices": generatePrices(28999)
    },
    {
        "id": "lg-nanocell-75",
        "name": "LG 75\" NanoCell 4K 75NANO76SRA Smart TV",
        "price": 47999,
        "image": "https://www.lg.com/tr/images/televizyonlar/md07526933/gallery/75NANO76SRA_350_D1.jpg",
        "desc": "Geniş açıdan mükemmel renkler, NanoCell teknolojisi.",
        "rating": 4.4,
        "category": "elektronik",
        "subcategory": "televizyon",
        "prices": generatePrices(47999)
    },
    {
        "id": "arcelik-a55-oled-pro",
        "name": "Arçelik 55\" OLED Pro Smart TV",
        "price": 45999,
        "image": "https://www.arcelik.com.tr/medias/55OLEDPRO-FrontView-1200Wx1200H.png?context=bWFzdGVyfGltYWdlc3wxMjUzNzF8aW1hZ2UvcG5nfGltYWdlcy9oYjYvaDgxLzk0NzA5OTU4MzUwMzgucG5nfDgxNjYxN2UyYjYxYzY2OTQxYjM2YjQ0M2Y5YjQwYjU5YjM4YzU1YzQ2YjUxYjUwYjA1YzQwYjQyYjA3ZWM",
        "desc": "Yerli OLED teknolojisi ve AI ses-görüntü iyileştirme.",
        "rating": 4.6,
        "category": "elektronik",
        "subcategory": "televizyon",
        "prices": generatePrices(45999)
    },
    {
        "id": "xiaomi-mi-tv-p1",
        "name": "Xiaomi Mi TV P1 55\" 4K Android TV",
        "price": 18999,
        "image": "https://i01.appmifile.com/webfile/globalimg/products/pc/mi-tv-p1-55/specs-header.png",
        "desc": "Uygun fiyatlı Android TV deneyimi ve 4K HDR.",
        "rating": 4.2,
        "category": "elektronik",
        "subcategory": "televizyon",
        "prices": generatePrices(18999)
    },
    {
        "id": "toshiba-55v35ke",
        "name": "Toshiba 55\" 4K UHD Smart TV 55V35KE",
        "price": 21999,
        "image": "https://www.toshiba.life/tr/-/media/Project/Toshiba/ToshibaLife/Products/Televisions/55V35KE/55V35KE_1.png",
        "desc": "REGZA Engine görüntü işlemci ve Dolby Audio.",
        "rating": 4.3,
        "category": "elektronik",
        "subcategory": "televizyon",
        "prices": generatePrices(21999)
    },
    {
        "id": "sony-bravia-x90l",
        "name": "Sony 65\" Bravia XR X90L 4K Smart TV",
        "price": 69999,
        "image": "https://www.sony.com.tr/image/9c8c5c2e4e4a8d4c1d8e3b8c5c5c5c5c?fmt=png-alpha&wid=1200",
        "desc": "Bilişsel işlemci XR ile gerçekçi görüntü ve ses.",
        "rating": 4.8,
        "category": "elektronik",
        "subcategory": "televizyon",
        "prices": generatePrices(69999)
    },

    // --- TABLET ---
    {
        "id": "samsung-galaxy-tab-s9-ultra",
        "name": "Samsung Galaxy Tab S9 Ultra",
        "price": 34999,
        "image": "https://images.samsung.com/tr/smartphones/galaxy-tab-s9-ultra/buy/02_Image-Carousel/01_Product-Image/01_Color/Gray/galaxy-tab-s9-ultra-gray-front.png",
        "desc": "En güçlü ve büyük ekranlı Samsung tablet.",
        "rating": 4.8,
        "category": "elektronik",
        "subcategory": "tablet",
        "prices": generatePrices(34999)
    },
    {
        "id": "apple-ipad-pro-129-m2",
        "name": "Apple iPad Pro 12.9\" (M2)",
        "price": 42999,
        "image": "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/ipad-pro-12-11-select-202210_FMT_WHH?wid=940&hei=1112&fmt=png-alpha&.v=1664411202954",
        "desc": "M2 çip ile profesyonel performans.",
        "rating": 4.9,
        "category": "elektronik",
        "subcategory": "tablet",
        "prices": generatePrices(42999)
    },
    {
        "id": "samsung-galaxy-tab-s9-plus",
        "name": "Samsung Galaxy Tab S9+",
        "price": 27999,
        "image": "https://images.samsung.com/tr/smartphones/galaxy-tab-s9-plus/buy/02_Image-Carousel/01_Product-Image/01_Color/Beige/galaxy-tab-s9-plus-beige-front.png",
        "desc": "S Pen ile üretkenlik odaklı premium tablet.",
        "rating": 4.7,
        "category": "elektronik",
        "subcategory": "tablet",
        "prices": generatePrices(27999)
    },
    {
        "id": "apple-ipad-air-5",
        "name": "Apple iPad Air 5",
        "price": 22999,
        "image": "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/ipad-air-select-wifi-blue-202203?wid=940&hei=1112&fmt=png-alpha&.v=1645066730356",
        "desc": "M1 çip, güçlü ve hafif.",
        "rating": 4.6,
        "category": "elektronik",
        "subcategory": "tablet",
        "prices": generatePrices(22999)
    },
    {
        "id": "lenovo-tab-p12-pro",
        "name": "Lenovo Tab P12 Pro",
        "price": 18999,
        "image": "https://www.lenovo.com/medias/lenovo-tab-p12-pro-subseries-hero.png?context=bWFzdGVyfHJvb3R8MjQwMjMxfGltYWdlL3BuZ3xoYjIvaDk5LzE0MjI4NDEwNDUwMTQyLnBuZ3w0YjQyM2I1ZTI4YzYyZTYwYzE5YjYwZjk0YjUwYjEwYjU3YjA5YzI4YzE5ZDAyYjQ5YzI4YzE5ZDAyYjQ5YzE2YjA2YjUyYjU4",
        "desc": "OLED ekran ve kalem desteği ile çok yönlülük.",
        "rating": 4.4,
        "category": "elektronik",
        "subcategory": "tablet",
        "prices": generatePrices(18999)
    },
    {
        "id": "huawei-matepad-pro-13",
        "name": "Huawei MatePad Pro 13.2\"",
        "price": 25999,
        "image": "https://consumer-img.huawei.com/content/dam/huawei-cbg-site/common/mkt/pdp/tablets/matepad-pro-13-2/list/image-01.png",
        "desc": "İnce çerçeveli, güçlü performanslı Huawei tableti.",
        "rating": 4.5,
        "category": "elektronik",
        "subcategory": "tablet",
        "prices": generatePrices(25999)
    },
    {
        "id": "apple-ipad-10nesil",
        "name": "Apple iPad 10. Nesil",
        "price": 14999,
        "image": "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/ipad-10-9-select-202210_FMT_WHH?wid=940&hei=1112&fmt=png-alpha&.v=1664411138333",
        "desc": "Renkli, modern tasarım ve A14 çip.",
        "rating": 4.3,
        "category": "elektronik",
        "subcategory": "tablet",
        "prices": generatePrices(14999)
    },
    {
        "id": "samsung-galaxy-tab-a9-plus",
        "name": "Samsung Galaxy Tab A9+",
        "price": 8999,
        "image": "https://images.samsung.com/is/image/samsung/assets/tr/galaxy-tab-a9/buy/01_carousel/01_product-image/01_default/galaxy-tab-a9-gray-front.png",
        "desc": "Uygun fiyatlı, günlük kullanım için ideal.",
        "rating": 4.2,
        "category": "elektronik",
        "subcategory": "tablet",
        "prices": generatePrices(8999)
    },
    {
        "id": "xiaomi-pad-6",
        "name": "Xiaomi Pad 6",
        "price": 11999,
        "image": "https://i01.appmifile.com/webfile/globalimg/products/pc/xiaomi-pad-6/specs-header.png",
        "desc": "Yüksek yenileme hızlı ekran, uygun fiyat.",
        "rating": 4.5,
        "category": "elektronik",
        "subcategory": "tablet",
        "prices": generatePrices(11999)
    },
    {
        "id": "amazon-fire-hd-10",
        "name": "Amazon Fire HD 10",
        "price": 3999,
        "image": "https://m.media-amazon.com/images/I/61rQqKPq8KL._AC_SL1500_.jpg",
        "desc": "Ekonomik, Amazon içerikleri için mükemmel.",
        "rating": 4,
        "category": "elektronik",
        "subcategory": "tablet",
        "prices": generatePrices(3999)
    },

    // --- LAPTOP ---
    {
        "id": "apple-macbook-air-m2",
        "name": "Apple MacBook Air M2 13.6 inç",
        "price": 49999,
        "image": "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/macbook-air-midnight-select-20220606?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1653084303665",
        "desc": "M2 çip ile inanılmaz güç ve taşınabilirlik.",
        "rating": 4.8,
        "category": "elektronik",
        "subcategory": "laptop",
        "prices": generatePrices(49999)
    },
    {
        "id": "lenovo-ideapad-gaming-3",
        "name": "Lenovo IdeaPad Gaming 3 15.6 inç",
        "price": 32999,
        "image": "https://p1-ofp.static.pub/medias/bWFzdGVyfHJvb3R8MTE2NDQ1fGltYWdlL3BuZ3xoZGUvaDk5LzEyMDI1MTA3OTgxMTgyLnBuZ3w5ZTEzYzE5N2Q3Y2QyZDMxYjQ4YzMxYjY5YzQzYjQzYjQwYjA2YjU0YjQyYjQyYjQyYjQyYjQyYjQyYjQyYjQyYg",
        "desc": "Oyun ve iş için mükemmel performans.",
        "rating": 4.5,
        "category": "elektronik",
        "subcategory": "laptop",
        "prices": generatePrices(32999)
    },
    {
        "id": "hp-pavilion-15",
        "name": "HP Pavilion 15-eg2007nt 15.6 inç",
        "price": 27999,
        "image": "https://ssl-product-images.www8-hp.com/digmedialib/prodimg/lowres/c07978648.png",
        "desc": "Şık tasarım ve günlük kullanım performansı.",
        "rating": 4.3,
        "category": "elektronik",
        "subcategory": "laptop",
        "prices": generatePrices(27999)
    },
    {
        "id": "asus-rog-strix-g15",
        "name": "ASUS ROG Strix G15 G513RC-HN077 15.6 inç",
        "price": 41999,
        "image": "https://dlcdnwebimgs.asus.com/gain/5B4A5C5B-5A5B-5C5D-5E5F-5A5B5C5D5E5F",
        "desc": "Üst düzey oyun deneyimi için ROG gücü.",
        "rating": 4.7,
        "category": "elektronik",
        "subcategory": "laptop",
        "prices": generatePrices(41999)
    },
    {
        "id": "acer-nitro-5-an515-58",
        "name": "Acer Nitro 5 AN515-58 15.6 inç",
        "price": 35999,
        "image": "https://static.acer.com/up/Resource/Acer/Laptops/Nitro_5/rev-2022/20220627/Nitro5-AN515-58_gal1.png",
        "desc": "Oyun tutkunları için güçlü ve uygun fiyatlı.",
        "rating": 4.4,
        "category": "elektronik",
        "subcategory": "laptop",
        "prices": generatePrices(35999)
    },
    {
        "id": "dell-inspiron-15-3520",
        "name": "Dell Inspiron 15 3520 15.6 inç",
        "price": 23999,
        "image": "https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/notebooks/inspiron-notebooks/15-3520/media-gallery/notebook-inspiron-15-3520-black-gallery-1.psd?fmt=pjpg&pscan=auto&scl=1&wid=3332&hei=2416&qlt=100,1&resMode=sharp2&size=3332,2416",
        "desc": "Güvenilir ve verimli günlük kullanım notebook'u.",
        "rating": 4.2,
        "category": "elektronik",
        "subcategory": "laptop",
        "prices": generatePrices(23999)
    },
    {
        "id": "msi-katana-gf66",
        "name": "MSI Katana GF66 12UC-621XTR 15.6 inç",
        "price": 38999,
        "image": "https://asset.msi.com/resize/image/global/product/product_10_20220311151718_16469830385a0f8f9e6e5e9.png62405b38c58fe0f07fcef2367d8a9ba1/1024.png",
        "desc": "İnce tasarımda yüksek oyun performansı.",
        "rating": 4.6,
        "category": "elektronik",
        "subcategory": "laptop",
        "prices": generatePrices(38999)
    },
    {
        "id": "apple-macbook-pro-14-m3",
        "name": "Apple MacBook Pro 14 inç M3",
        "price": 89999,
        "image": "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/mbp14-spaceblack-select-202310?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1697310910854",
        "desc": "Profesyoneller için nihai yaratıcı araç.",
        "rating": 4.9,
        "category": "elektronik",
        "subcategory": "laptop",
        "prices": generatePrices(89999)
    },
    {
        "id": "asus-vivobook-pro-15",
        "name": "ASUS Vivobook Pro 15 OLED K6502ZC-MA043W 15.6 inç",
        "price": 34999,
        "image": "https://dlcdnwebimgs.asus.com/gain/5B4A5C5B-5A5B-5C5D-5E5F-5A5B5C5D5E5F/1",
        "desc": "Harika OLED ekran ve içerik oluşturma gücü.",
        "rating": 4.5,
        "category": "elektronik",
        "subcategory": "laptop",
        "prices": generatePrices(34999)
    },
    {
        "id": "lenovo-thinkpad-e15",
        "name": "Lenovo ThinkPad E15 Gen 4 15.6 inç",
        "price": 29999,
        "image": "https://p1-ofp.static.pub/medias/bWFzdGVyfHJvb3R8MTE2NDQ1fGltYWdlL3BuZ3xoZGUvaDk5LzEyMDI1MTA3OTgxMTgyLnBuZ3w5ZTEzYzE5N2Q3Y2QyZDMxYjQ4YzMxYjY5YzQzYjQzYjQwYjA2YjU0YjQyYjQyYjQyYjQyYjQyYjQyYjQyYjQyYg",
        "desc": "İş dünyası için dayanıklı ve güvenilir.",
        "rating": 4.4,
        "category": "elektronik",
        "subcategory": "laptop",
        "prices": generatePrices(29999)
    },

    // --- KURUTMA MAKINESI ---
    {
        "id": "bosch-serie-4-wtw875w1tr",
        "name": "Bosch Serie 4 WTW875W1TR A+++ 9 kg Kurutma Makinesi",
        "price": 29999,
        "image": "https://www.bosch-home.com.tr/medias/600x600-WTW875W1TR-1-600x600-WTW875W1TR-1.png?context=bWFzdGVyfHJvb3R8MjI3MjQxfGltYWdlL3BuZ3xoYjMvaDg3LzEwNTYwMzg2OTUyNjA2LzYwMHg2MDAtV1RXNzg1VzFUUi0xLnBuZ3w0YzM2YjYwYzYzYjU4YjQzYjUwM2QyYjY5YjQyYjQwYjQyYjQyYjQyYjQyYjQyYjQyYjQyYjQyYjQy",
        "desc": "Enerji tasarruflu, sessiz ve yüksek kapasiteli.",
        "rating": 4.6,
        "category": "elektronik",
        "subcategory": "kurutma-makinesi",
        "prices": generatePrices(29999)
    },
    {
        "id": "samsung-dv90ta040ae-tk",
        "name": "Samsung DV90TA040AE/TK Heat Pump 9 kg Kurutma Makinesi",
        "price": 34999,
        "image": "https://images.samsung.com/is/image/samsung/tr-dryer-dv90ta040ae-tk-frontblack-530944537?$720_576_PNG$",
        "desc": "Isı pompalı teknoloji ile enerji tasarrufu.",
        "rating": 4.8,
        "category": "elektronik",
        "subcategory": "kurutma-makinesi",
        "prices": generatePrices(34999)
    },
    {
        "id": "arcelik-9143-ykm-a",
        "name": "Arçelik 9143 YKM A+++ 9 kg Kurutma Makinesi",
        "price": 27999,
        "image": "https://www.arcelik.com.tr/medias/9143YKM-1-600Wx600H?context=bWFzdGVyfHJvb3R8MTk5NzQ3fGltYWdlL3BuZ3xoYjYvaDg1LzEwNTYwMzg2OTUyNjA2LzkxNDNZS00tMS5wbmd8NDQzYjYwYzYzYjU4YjQzYjUwM2QyYjY5YjQyYjQwYjQyYjQyYjQyYjQyYjQyYjQyYjQyYjQyYjQy",
        "desc": "Yüksek kurutma performansı ve sessiz çalışma.",
        "rating": 4.5,
        "category": "elektronik",
        "subcategory": "kurutma-makinesi",
        "prices": generatePrices(27999)
    },
    {
        "id": "profilo-cd93p3tr",
        "name": "Profilo CD93P3TR A+++ 9 kg Kurutma Makinesi",
        "price": 23999,
        "image": "https://www.profilo.com.tr/medias/CD93P3TR-1-600Wx600H?context=bWFzdGVyfHJvb3R8MTk5NzQ3fGltYWdlL3BuZ3xoYjYvaDg1LzEwNTYwMzg2OTUyNjA2L0NEOThQM1RSLTEucG5nfDQ0M2I2MGM2M2I1OGI0M2I1MDNkMmI2OWI0MmI0MGI0MmI0MmI0MmI0MmI0MmI0MmI0MmI0MmI0MmI0",
        "desc": "Güvenilir ve ekonomik kurutma çözümü.",
        "rating": 4.4,
        "category": "elektronik",
        "subcategory": "kurutma-makinesi",
        "prices": generatePrices(23999)
    },
    {
        "id": "vestel-km-9101-a",
        "name": "Vestel KM 9101 A+++ 9 kg Kurutma Makinesi",
        "price": 19999,
        "image": "https://st-vstl.mncdn.com/Content/Images/Thumbs/0172849_km-9101-a-9-kg-kurutma-makinesi.png",
        "desc": "Uygun fiyatlı, yüksek performanslı kurutucu.",
        "rating": 4.3,
        "category": "elektronik",
        "subcategory": "kurutma-makinesi",
        "prices": generatePrices(19999)
    },
    {
        "id": "lg-rc90v9av2w",
        "name": "LG RC90V9AV2W Heat Pump 9 kg Kurutma Makinesi",
        "price": 36999,
        "image": "https://www.lg.com/tr/images/urunler/cekirdek/rc90v9av2w/gallery/medium01.jpg",
        "desc": "Buharlı ve ısı pompalı akıllı kurutma.",
        "rating": 4.7,
        "category": "elektronik",
        "subcategory": "kurutma-makinesi",
        "prices": generatePrices(36999)
    },
    {
        "id": "altus-al-9101-a",
        "name": "Altus AL 9101 A A+++ 9 kg Kurutma Makinesi",
        "price": 21999,
        "image": "https://www.altus.com.tr/medias/AL-9101-A-1-600Wx600H?context=bWFzdGVyfHJvb3R8MTk5NzQ3fGltYWdlL3BuZ3xoYjYvaDg1LzEwNTYwMzg2OTUyNjA2L0FMLTkxMDEtQS0xLnBuZ3w0NDNiNjBjNjNiNThiNDNiNTAzZDJiNjliNDJiNDBiNDJiNDJiNDJiNDJiNDJiNDJiNDJiNDJiNDJiNDJi",
        "desc": "Pratik ve dayanıklı kurutma makinesi.",
        "rating": 4.2,
        "category": "elektronik",
        "subcategory": "kurutma-makinesi",
        "prices": generatePrices(21999)
    },
    {
        "id": "grundig-gtn-99220-a",
        "name": "Grundig GTN 99220 A+++ 9 kg Kurutma Makinesi",
        "price": 28999,
        "image": "https://www.grundig.com/tr/images/urunler/cekirdek/gtn-99220-a/gallery/medium01.jpg",
        "desc": "Hassas kumaşlar için özel programlar.",
        "rating": 4.5,
        "category": "elektronik",
        "subcategory": "kurutma-makinesi",
        "prices": generatePrices(28999)
    },
    {
        "id": "beko-d-8101-a",
        "name": "Beko D 8101 A A+++ 8 kg Kurutma Makinesi",
        "price": 22999,
        "image": "https://www.beko.com.tr/medias/D-8101-A-1-600Wx600H?context=bWFzdGVyfHJvb3R8MTk5NzQ3fGltYWdlL3BuZ3xoYjYvaDg1LzEwNTYwMzg2OTUyNjA2L0QtODEwMS1BLTEucG5nfDQ0M2I2MGM2M2I1OGI0M2I1MDNkMmI2OWI0MmI0MGI0MmI0MmI0MmI0MmI0MmI0MmI0MmI0MmI0",
        "desc": "Kompakt tasarım, yüksek verimlilik.",
        "rating": 4.4,
        "category": "elektronik",
        "subcategory": "kurutma-makinesi",
        "prices": generatePrices(22999)
    },
    {
        "id": "siemens-wt47wh0tr",
        "name": "Siemens WT47WH0TR iQ500 A+++ 9 kg Kurutma Makinesi",
        "price": 32999,
        "image": "https://www.siemens-home.bsh-group.com/tr/medias/600x600-WT47WH0TR-1-600x600-WT47WH0TR-1.png?context=bWFzdGVyfHJvb3R8MjI3MjQxfGltYWdlL3BuZ3xoYjMvaDg3LzEwNTYwMzg2OTUyNjA2LzYwMHg2MDAtV1Q0N1dIMFRSLTEucG5nfDQ0M2I2MGM2M2I1OGI0M2I1MDNkMmI2OWI0MmI0MGI0MmI0MmI0MmI0MmI0MmI0MmI0MmI0MmI0MmI0",
        "desc": "Profesyonel kurutma performansı ve sessizlik.",
        "rating": 4.7,
        "category": "elektronik",
        "subcategory": "kurutma-makinesi",
        "prices": generatePrices(32999)
    },

    // --- KARIŞIK DİĞER KATEGORİLER (ESKİ VERİLERDEN) ---
    { id: "airpods-pro-2", name: "AirPods Pro 2. Nesil", category: "elektronik", subcategory: "bluetooth-kulaklik", price: 9000, image: "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/MQD83?wid=1144&hei=1144&fmt=jpeg&qlt=95&.v=1660803972361", desc: "Aktif gürültü engelleme, uzamsal ses.", rating: 4.8, prices: generatePrices(9000) },
    { id: "sony-wh1000xm5", name: "Sony WH-1000XM5", category: "elektronik", subcategory: "bluetooth-kulaklik", price: 12500, image: "https://www.sony.com.tr/image/6145c1d32e6ac8e63a46c912dc33c5bb?fmt=pjpeg&wid=330&bgcolor=FFFFFF&bgc=FFFFFF", desc: "Sektör lideri NC.", rating: 4.7, prices: generatePrices(12500) },
    { id: "samsung-buds-2-pro", name: "Samsung Galaxy Buds2 Pro", category: "elektronik", subcategory: "bluetooth-kulaklik", price: 4500, image: "https://images.samsung.com/is/image/samsung/p6pim/tr/2208/gallery/tr-galaxy-buds2-pro-r510-sm-r510nzaatur-533190874?$684_547_PNG$", desc: "24-bit Hi-Fi ses.", rating: 4.4, prices: generatePrices(4500) },

    { id: "msi-raider", name: "MSI Raider GE78", category: "elektronik", subcategory: "oyun-bilgisayari", price: 110000, image: "https://asset.msi.com/resize/image/global/product/notebook/GE78-HX-13V-Black-20221213.png624053898624053898/600.png", desc: "RTX 4080, i9 işlemci, RGB şöleni.", rating: 4.8, prices: generatePrices(110000) },
    { id: "monster-tulpar", name: "Monster Tulpar T7", category: "elektronik", subcategory: "oyun-bilgisayari", price: 65000, image: "https://www.monsternotebook.com.tr/UPLOAD/urun-gorselleri-yeni/TULPAR/T7_V20/thumb/01_large.png", desc: "Yerli canavar, RTX 4070.", rating: 4.5, prices: generatePrices(65000) },

    { id: "samsung-odyssey-g9", name: "Samsung Odyssey G9 OLED", category: "elektronik", subcategory: "monitor", price: 45000, image: "https://images.samsung.com/is/image/samsung/p6pim/tr/ls49cg954suxuf/gallery/tr-odyssey-oled-g9-g95sc-ls49cg954suxuf-537064805?$684_547_PNG$", desc: "49 inç ultra geniş kavisli.", rating: 4.9, prices: generatePrices(45000) },
    { id: "lg-ultragear", name: "LG UltraGear 27GR95QE", category: "elektronik", subcategory: "monitor", price: 28000, image: "https://www.lg.com/content/dam/channel/wcms/tr/images/monitor/27gr95qe-b_atrq_e_m_1/gallery/medium01.jpg", desc: "27 inç OLED, 240Hz.", rating: 4.8, prices: generatePrices(28000) },

    { id: "dyson-gen5", name: "Dyson Gen5detect", category: "ev-yasam", subcategory: "dikey-supurge", price: 35000, image: "https://dyson-h.assetsadobe2.com/is/image/content/dam/dyson/products/vacuum-cleaners/cordless/gen5/sv23/pdp/colourway-images/Gen5-Prussian-Blue-Copper-LB.png?scl=1&fmt=png-alpha", desc: "En güçlü Dyson, mikroskobik toz tespiti.", rating: 4.9, prices: generatePrices(35000) },

    { id: "roborock-s8", name: "Roborock S8 Pro Ultra", category: "ev-yasam", subcategory: "robot-supurge", price: 42000, image: "https://m.media-amazon.com/images/I/61k1K-jXW+L._AC_SL1500_.jpg", desc: "Tam otomatik istasyon, çift fırça.", rating: 4.9, prices: generatePrices(42000) },

    { id: "rtx-4090", name: "MSI GeForce RTX 4090", category: "elektronik", subcategory: "ekran-karti", price: 95000, image: "https://asset.msi.com/resize/image/global/product/vga/GeForce-RTX-4090-GAMING-X-TRIO-24G-1.png624053898624053898/600.png", desc: "Dünyanın en güçlüsü.", rating: 5.0, prices: generatePrices(95000) },

    { id: "apple-watch-ultra-2", name: "Apple Watch Ultra 2", category: "elektronik", subcategory: "akilli-saat", price: 40000, image: "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/watch-ultra2-digitalmat-gallery-1-202409?wid=728&hei=666&fmt=png-alpha&.v=1725062630324", desc: "Maceracılar için en dayanıklı saat.", rating: 4.9, prices: generatePrices(40000) },
    { id: "samsung-watch-6-classic", name: "Samsung Galaxy Watch 6 Classic", category: "elektronik", subcategory: "akilli-saat", price: 9000, image: "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-watch6-classic.jpg", desc: "Döner çerçeve geri döndü.", rating: 4.5, prices: generatePrices(9000) },

    // --- EV / MODA ---
    { id: "nike-air-max", name: "Nike Air Max", category: "moda", price: 4500, image: "👟", desc: "Günlük kullanım için ikonik tasarım.", rating: 4.5, prices: generatePrices(4500) },
    { id: "zara-blazer", name: "Zara Blazer Ceket", category: "moda", price: 3200, image: "🧥", desc: "Ofis şıklığı için modern kesim.", rating: 4.3, prices: generatePrices(3200) },
    { id: "philips-airfryer", name: "Philips Airfryer XXL", category: "ev-yasam", price: 8500, image: "🍟", desc: "Az yağ ile çıtır lezzetler.", rating: 4.8, prices: generatePrices(8500) },
];
