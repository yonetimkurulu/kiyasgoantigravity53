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
    // --- CEP TELEFONLUARI (Mevcut + Yeni) ---
    { id: "iphone-17-pro", name: "iPhone 17 Pro", category: "elektronik", subcategory: "cep-telefonu", price: 95000, image: "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro.jpg", desc: "A19 Pro çip, devrimsel kamera.", rating: 5.0, prices: generatePrices(95000) },
    { id: "samsung-s24-ultra", name: "Samsung Galaxy S24 Ultra", category: "elektronik", subcategory: "cep-telefonu", price: 72000, image: "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-ultra-5g-sm-s928.jpg", desc: "Galaxy AI özellikleri, 200MP kamera.", rating: 4.7, prices: generatePrices(72000) },
    { id: "xiaomi-13t-pro", name: "Xiaomi 13T Pro", category: "elektronik", subcategory: "cep-telefonu", price: 33000, image: "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-13t-pro.jpg", desc: "Leica kamera, 144Hz ekran.", rating: 4.7, prices: generatePrices(33000) },

    // --- TELEVIZYON ---
    { id: "samsung-55-oled", name: "Samsung 55S95C OLED TV", category: "elektronik", subcategory: "televizyon", price: 65000, image: "https://images.samsung.com/is/image/samsung/p6pim/tr/qe55s95catxtk/gallery/tr-oled-s95c-qe55s95catxtk-536442653?$684_547_PNG$", desc: "4K OLED, sonsuz kontrast, 144Hz.", rating: 4.8, prices: generatePrices(65000) },
    { id: "lg-c3-oled", name: "LG OLED55C34LA", category: "elektronik", subcategory: "televizyon", price: 58000, image: "https://www.lg.com/tr/images/tvs/md07567794/gallery/medium01.jpg", desc: "OLED evo panel, a9 Gen6 işlemci.", rating: 4.9, prices: generatePrices(58000) },
    { id: "philips-ambilight", name: "Philips 55PUS8808", category: "elektronik", subcategory: "televizyon", price: 32000, image: "https://images.philips.com/is/image/PhilipsConsumer/55PUS8808_62-IMS-tr_TR?$jpglarge$&wid=960", desc: "Ambilight TV, The One, 120Hz.", rating: 4.5, prices: generatePrices(32000) },

    // --- LAPTOP ---
    { id: "macbook-air-m2", name: "MacBook Air M2", category: "elektronik", subcategory: "laptop", price: 42000, image: "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/macbook-air-midnight-select-20220606?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1653084303666", desc: "M2 çip, 18 saat pil ömrü, fansız tasarım.", rating: 4.9, prices: generatePrices(42000) },
    { id: "dell-xps-13", name: "Dell XPS 13 Plus", category: "elektronik", subcategory: "laptop", price: 55000, image: "https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/notebooks/xps-notebooks/xps-13-plus-9320/media-gallery/ticket-5942/notebook-xps-9320-gray-gallery-3.psd?fmt=png-alpha&pscan=auto&scl=1&hei=402&wid=606&qlt=100,1&resMode=sharp2&size=606,402&chrss=full", desc: "Fütüristik tasarım, 12. nesil Intel i7.", rating: 4.4, prices: generatePrices(55000) },
    { id: "asus-zenbook", name: "Asus Zenbook 14 OLED", category: "elektronik", subcategory: "laptop", price: 38000, image: "https://dlcdnwebimgs.asus.com/gain/35472852-7788-4444-8844-338877551155/w1000/h732", desc: "2.8K OLED ekran, ultra ince.", rating: 4.6, prices: generatePrices(38000) },

    // --- TABLET ---
    { id: "ipad-pro-m4", name: "iPad Pro M4 (13 inç)", category: "elektronik", subcategory: "tablet", price: 68000, image: "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/ipad-pro-model-select-gallery-2-202405?wid=5120&hei=2880&fmt=p-jpg&qlt=95&.v=1713935742511", desc: "M4 çip, Tandem OLED ekran.", rating: 5.0, prices: generatePrices(68000) },
    { id: "samsung-tab-s9", name: "Samsung Galaxy Tab S9 Ultra", category: "elektronik", subcategory: "tablet", price: 45000, image: "https://images.samsung.com/is/image/samsung/p6pim/tr/sm-x910nzaatur/gallery/tr-galaxy-tab-s9-ultra-wifi-x910-sm-x910nzaatur-537837770?$684_547_PNG$", desc: "14.6 inç dev ekran, S Pen dahil.", rating: 4.8, prices: generatePrices(45000) },
    { id: "ipad-air-m2", name: "iPad Air M2", category: "elektronik", subcategory: "tablet", price: 25000, image: "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/ipad-air-storage-select-202405-11inch-blue?wid=5120&hei=2880&fmt=p-jpg&qlt=95&.v=1713985558451", desc: "M2 performans, hafif tasarım.", rating: 4.7, prices: generatePrices(25000) },

    // --- AKILLI SAAT ---
    { id: "apple-watch-ultra-2", name: "Apple Watch Ultra 2", category: "elektronik", subcategory: "akilli-saat", price: 40000, image: "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/watch-ultra2-digitalmat-gallery-1-202409?wid=728&hei=666&fmt=png-alpha&.v=1725062630324", desc: "Maceracılar için en dayanıklı saat.", rating: 4.9, prices: generatePrices(40000) },
    { id: "samsung-watch-6-classic", name: "Samsung Galaxy Watch 6 Classic", category: "elektronik", subcategory: "akilli-saat", price: 9000, image: "https://images.samsung.com/is/image/samsung/p6pim/tr/2307/gallery/tr-galaxy-watch6-classic-r965-sm-r960nzkatur-537407073?$684_547_PNG$", desc: "Döner çerçeve geri döndü.", rating: 4.5, prices: generatePrices(9000) },
    { id: "huawei-watch-gt-4", name: "Huawei Watch GT 4", category: "elektronik", subcategory: "akilli-saat", price: 7500, image: "https://consumer.huawei.com/content/dam/huawei-cbg-site/common/mkt/pdp/wearables/watch-gt4/gallery/green/1.png", desc: "Şık tasarım, 2 hafta pil ömrü.", rating: 4.6, prices: generatePrices(7500) },

    // --- BLUETOOTH KULAKLIK ---
    { id: "airpods-pro-2", name: "AirPods Pro 2. Nesil", category: "elektronik", subcategory: "bluetooth-kulaklik", price: 9000, image: "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/MQD83?wid=1144&hei=1144&fmt=jpeg&qlt=95&.v=1660803972361", desc: "Aktif gürültü engelleme, uzamsal ses.", rating: 4.8, prices: generatePrices(9000) },
    { id: "sony-wh1000xm5", name: "Sony WH-1000XM5", category: "elektronik", subcategory: "bluetooth-kulaklik", price: 12500, image: "https://www.sony.com.tr/image/6145c1d32e6ac8e63a46c912dc33c5bb?fmt=pjpeg&wid=330&bgcolor=FFFFFF&bgc=FFFFFF", desc: "Sektör lideri NC.", rating: 4.7, prices: generatePrices(12500) },
    { id: "samsung-buds-2-pro", name: "Samsung Galaxy Buds2 Pro", category: "elektronik", subcategory: "bluetooth-kulaklik", price: 4500, image: "https://images.samsung.com/is/image/samsung/p6pim/tr/2208/gallery/tr-galaxy-buds2-pro-r510-sm-r510nzaatur-533190874?$684_547_PNG$", desc: "24-bit Hi-Fi ses.", rating: 4.4, prices: generatePrices(4500) },

    // --- OYUN BILGISAYARI ---
    { id: "msi-raider", name: "MSI Raider GE78", category: "elektronik", subcategory: "oyun-bilgisayari", price: 110000, image: "https://asset.msi.com/resize/image/global/product/notebook/GE78-HX-13V-Black-20221213.png624053898624053898/600.png", desc: "RTX 4080, i9 işlemci, RGB şöleni.", rating: 4.8, prices: generatePrices(110000) },
    { id: "monster-tulpar", name: "Monster Tulpar T7", category: "elektronik", subcategory: "oyun-bilgisayari", price: 65000, image: "https://www.monsternotebook.com.tr/UPLOAD/urun-gorselleri-yeni/TULPAR/T7_V20/thumb/01_large.png", desc: "Yerli canavar, RTX 4070.", rating: 4.5, prices: generatePrices(65000) },
    { id: "asus-rog-strix", name: "Asus ROG Strix G16", category: "elektronik", subcategory: "oyun-bilgisayari", price: 75000, image: "https://dlcdnwebimgs.asus.com/gain/49333919-4889-4499-9944-774433881119/w1000/h732", desc: "Espor seviyesi performans.", rating: 4.7, prices: generatePrices(75000) },

    // --- MONİTÖR ---
    { id: "samsung-odyssey-g9", name: "Samsung Odyssey G9 OLED", category: "elektronik", subcategory: "monitor", price: 45000, image: "https://images.samsung.com/is/image/samsung/p6pim/tr/ls49cg954suxuf/gallery/tr-odyssey-oled-g9-g95sc-ls49cg954suxuf-537064805?$684_547_PNG$", desc: "49 inç ultra geniş kavisli.", rating: 4.9, prices: generatePrices(45000) },
    { id: "lg-ultragear", name: "LG UltraGear 27GR95QE", category: "elektronik", subcategory: "monitor", price: 28000, image: "https://www.lg.com/tr/images/monitor/md07570498/gallery/medium01.jpg", desc: "27 inç OLED, 240Hz.", rating: 4.8, prices: generatePrices(28000) },
    { id: "asus-tuf-gaming", name: "Asus TUF Gaming VG27AQ", category: "elektronik", subcategory: "monitor", price: 11000, image: "https://dlcdnwebimgs.asus.com/gain/33446699-1144-4888-8811-331155997788/w1000/h732", desc: "1ms IPS, 165Hz F/P kralı.", rating: 4.6, prices: generatePrices(11000) },

    // --- DİKEY SÜPÜRGE ---
    { id: "dyson-gen5", name: "Dyson Gen5detect", category: "ev-yasam", subcategory: "dikey-supurge", price: 35000, image: "https://dyson-h.assetsadobe2.com/is/image/content/dam/dyson/products/vacuum-cleaners/cordless/gen5/sv23/pdp/colourway-images/Gen5-Prussian-Blue-Copper-LB.png?scl=1&fmt=png-alpha", desc: "En güçlü Dyson, mikroskobik toz tespiti.", rating: 4.9, prices: generatePrices(35000) },
    { id: "philips-mid", name: "Philips SpeedPro Max", category: "ev-yasam", subcategory: "dikey-supurge", price: 12000, image: "https://images.philips.com/is/image/PhilipsConsumer/XC7043_01-IMS-tr_TR?$jpglarge$&wid=960", desc: "360 derece emiş başlığı.", rating: 4.4, prices: generatePrices(12000) },
    { id: "xiaomi-g11", name: "Xiaomi Vacuum Cleaner G11", category: "ev-yasam", subcategory: "dikey-supurge", price: 15000, image: "https://i01.appmifile.com/webfile/globalimg/products/pc/xiaomi-vacuum-cleaner-g11/section01-header.png", desc: "185 AW emiş gücü.", rating: 4.5, prices: generatePrices(15000) },

    // --- ROBOT SÜPÜRGE ---
    { id: "roborock-s8", name: "Roborock S8 Pro Ultra", category: "ev-yasam", subcategory: "robot-supurge", price: 42000, image: "https://images-na.ssl-images-amazon.com/images/I/61k1K-jXW+L._AC_SL1500_.jpg", desc: "Tam otomatik istasyon, çift fırça.", rating: 4.9, prices: generatePrices(42000) },
    { id: "xiaomi-robot-s10", name: "Xiaomi Robot Vacuum S10+", category: "ev-yasam", subcategory: "robot-supurge", price: 14000, image: "https://i01.appmifile.com/v1/MI_18455B3E4DA706226CF7535A58E875F0267/pms_1677833503.74326164.png", desc: "Çift paspaslı temizlik.", rating: 4.5, prices: generatePrices(14000) },
    { id: "irobot-roomba", name: "iRobot Roomba Combo j7+", category: "ev-yasam", subcategory: "robot-supurge", price: 29000, image: "https://m.media-amazon.com/images/I/61+y+w+w+1L._AC_SL1500_.jpg", desc: "Engelleri tanıyan zeka.", rating: 4.6, prices: generatePrices(29000) },

    // --- EKRAN KARTI ---
    { id: "rtx-4090", name: "MSI GeForce RTX 4090", category: "elektronik", subcategory: "ekran-karti", price: 95000, image: "https://asset.msi.com/resize/image/global/product/vga/GeForce-RTX-4090-GAMING-X-TRIO-24G-1.png624053898624053898/600.png", desc: "Dünyanın en güçlüsü.", rating: 5.0, prices: generatePrices(95000) },
    { id: "rtx-4070-ti", name: "Asus TUF RTX 4070 Ti", category: "elektronik", subcategory: "ekran-karti", price: 45000, image: "https://dlcdnwebimgs.asus.com/gain/44888899-7755-4422-9988-118855554444/w1000/h732", desc: "2K oyun canavarı.", rating: 4.7, prices: generatePrices(45000) },
    { id: "rx-7900-xtx", name: "Sapphire Radeon RX 7900 XTX", category: "elektronik", subcategory: "ekran-karti", price: 48000, image: "https://cdn.dsmcdn.com/ty671/product/media/images/20230105/14/252323326/665660898/1/1_org_zoom.jpg", desc: "AMD'nin zirvesi.", rating: 4.6, prices: generatePrices(48000) },

    // --- KURUTMA MAKİNESİ ---
    { id: "siemens-iq500", name: "Siemens iQ500", category: "ev-yasam", subcategory: "kurutma-makinesi", price: 25000, image: "https://media3.bsh-group.com/Product_Shots/1600x900/MCSA02652683_WQ41G200TR_def.jpg", desc: "Isı pompalı, A++ enerji.", rating: 4.8, prices: generatePrices(25000) },
    { id: "bosch-serie-6", name: "Bosch Serie 6", category: "ev-yasam", subcategory: "kurutma-makinesi", price: 24000, image: "https://media3.bsh-group.com/Product_Shots/1600x900/MCSA02844444_WQG24100TR_def.jpg", desc: "SensitiveDrying system.", rating: 4.7, prices: generatePrices(24000) },
    { id: "samsung-kurutma", name: "Samsung 9 Kg Kurutma", category: "ev-yasam", subcategory: "kurutma-makinesi", price: 21000, image: "https://images.samsung.com/is/image/samsung/p6pim/tr/dv90t5240aw-ah/gallery/tr-heatpump-dryer-dv90t5240aw-dv90t5240aw-ah-532297779?$684_547_PNG$", desc: "Yapay zeka kontrollü kurutma.", rating: 4.5, prices: generatePrices(21000) },
];
