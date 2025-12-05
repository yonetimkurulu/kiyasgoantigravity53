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
];
