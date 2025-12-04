import React from 'react';

export const generatePrices = (basePrice) => [
    { store: "Trendyol", price: basePrice, color: "text-orange-600 dark:text-orange-400" },
    { store: "Hepsiburada", price: basePrice - 500, color: "text-orange-500 dark:text-orange-300" },
    { store: "Amazon", price: basePrice + 250, color: "text-yellow-600 dark:text-yellow-400" },
    { store: "N11", price: basePrice + 100, color: "text-purple-600 dark:text-purple-400" },
    { store: "MediaMarkt", price: basePrice + 1000, color: "text-red-600 dark:text-red-400" },
];

export const ELECTRONICS_SUBCATEGORIES = [
    { id: "cep-telefonu", label: "Cep Telefonu", icon: "📱" },
    { id: "televizyon", label: "Televizyon", icon: "📺" },
    { id: "monitor", label: "Monitör", icon: "🖥️" },
    { id: "bluetooth-kulaklik", label: "Bluetooth Kulaklık", icon: "🎧" },
    { id: "ekran-karti", label: "Ekran Kartı", icon: "🎮" },
    { id: "dikey-supurge", label: "Dikey Süpürge", icon: "🧹" },
    { id: "tablet", label: "Tablet", icon: "📟" },
    { id: "laptop", label: "Laptop ve Notebook", icon: "💻" },
    { id: "oyun-bilgisayari", label: "Oyun Bilgisayarı", icon: "🕹️" },
    { id: "robot-supurge", label: "Robot Süpürge", icon: "🤖" },
    { id: "akilli-saat", label: "Akıllı Saat", icon: "⌚" },
    { id: "kurutma-makinesi", label: "Kurutma Makinesi", icon: "🧺" },
];

export const PRODUCTS_DATA = [
    // 2025 Flagships (Yeni Eklenenler)
    { id: "iphone-17-pro", name: "iPhone 17 Pro", category: "elektronik", subcategory: "cep-telefonu", price: 95000, image: "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro.jpg", desc: "A19 Pro çip, devrimsel kamera.", rating: 5.0, prices: generatePrices(95000) },
    { id: "iphone-16-pro", name: "iPhone 16 Pro", category: "elektronik", subcategory: "cep-telefonu", price: 82000, image: "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro.jpg", desc: "A18 Pro çip, yapay zeka odaklı.", rating: 4.9, prices: generatePrices(82000) },
    { id: "samsung-s25-ultra", name: "Samsung S25 Ultra", category: "elektronik", subcategory: "cep-telefonu", price: 88000, image: "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-ultra-5g-sm-s928.jpg", desc: "Snapdragon 8 Gen 4, 300MP kamera.", rating: 4.9, prices: generatePrices(88000) },

    // Mevcut Ürünler
    { id: "iphone-15-pro", name: "iPhone 15 Pro", category: "elektronik", subcategory: "cep-telefonu", price: 75000, image: "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-pro.jpg", desc: "Titanyum tasarım, A17 Pro çip.", rating: 4.8, prices: generatePrices(75000) },
    { id: "samsung-s24-ultra", name: "Samsung S24 Ultra", category: "elektronik", subcategory: "cep-telefonu", price: 72000, image: "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-ultra-5g-sm-s928.jpg", desc: "Galaxy AI özellikleri, 200MP kamera.", rating: 4.7, prices: generatePrices(72000) },
    { id: "dyson-v15", name: "Dyson V15", category: "ev-yasam", subcategory: "dikey-supurge", price: 25000, image: "🧹", desc: "Lazer teknolojili kablosuz süpürge.", rating: 4.9, prices: generatePrices(25000) },
    { id: "nike-air-max", name: "Nike Air Max", category: "moda", price: 4500, image: "👟", desc: "Günlük kullanım için ikonik tasarım.", rating: 4.5, prices: generatePrices(4500) },
    { id: "sony-wh-1000xm5", name: "Sony WH-1000XM5", category: "elektronik", subcategory: "bluetooth-kulaklik", price: 12000, image: "🎧", desc: "Endüstri lideri gürültü engelleme.", rating: 4.6, prices: generatePrices(12000) },
    { id: "zara-blazer", name: "Zara Blazer Ceket", category: "moda", price: 3200, image: "🧥", desc: "Ofis şıklığı için modern kesim.", rating: 4.3, prices: generatePrices(3200) },
    { id: "philips-airfryer", name: "Philips Airfryer XXL", category: "ev-yasam", price: 8500, image: "🍟", desc: "Az yağ ile çıtır lezzetler.", rating: 4.8, prices: generatePrices(8500) },
    { id: "macbook-air-m2", name: "MacBook Air M2", category: "elektronik", subcategory: "laptop", price: 42000, image: "💻", desc: "İnce, hafif ve güçlü M2 işlemci.", rating: 4.9, prices: generatePrices(42000) },

    // Yeni Cep Telefonları (10+ Adet)
    { id: "iphone-14", name: "iPhone 14", category: "elektronik", subcategory: "cep-telefonu", price: 58000, image: "📱", desc: "A15 Bionic çip, çift kamera sistemi.", rating: 4.6, prices: generatePrices(58000) },
    { id: "iphone-13", name: "iPhone 13", category: "elektronik", subcategory: "cep-telefonu", price: 42000, image: "📱", desc: "Sinematik mod, dayanıklı tasarım.", rating: 4.5, prices: generatePrices(42000) },
    { id: "samsung-s23-fe", name: "Samsung Galaxy S23 FE", category: "elektronik", subcategory: "cep-telefonu", price: 24000, image: "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s23-fe.jpg", desc: "İkonik tasarım, güçlü performans.", rating: 4.4, prices: generatePrices(24000) },
    { id: "xiaomi-13t-pro", name: "Xiaomi 13T Pro", category: "elektronik", subcategory: "cep-telefonu", price: 33000, image: "📱", desc: "Leica kamera, 144Hz ekran.", rating: 4.7, prices: generatePrices(33000) },
    { id: "redmi-note-13-pro", name: "Redmi Note 13 Pro", category: "elektronik", subcategory: "cep-telefonu", price: 16500, image: "📱", desc: "200MP kamera, 67W hızlı şarj.", rating: 4.3, prices: generatePrices(16500) },
    { id: "huawei-p60-pro", name: "Huawei P60 Pro", category: "elektronik", subcategory: "cep-telefonu", price: 39000, image: "📱", desc: "Ultra aydınlatmalı XMAGE kamera.", rating: 4.8, prices: generatePrices(39000) },
    { id: "honor-90", name: "Honor 90", category: "elektronik", subcategory: "cep-telefonu", price: 18000, image: "📱", desc: "200MP ultra net kamera, göz dostu ekran.", rating: 4.5, prices: generatePrices(18000) },
    { id: "nothing-phone-2", name: "Nothing Phone (2)", category: "elektronik", subcategory: "cep-telefonu", price: 29000, image: "📱", desc: "Glyph arayüzü, şeffaf tasarım.", rating: 4.6, prices: generatePrices(29000) },
    { id: "realme-11-pro", name: "Realme 11 Pro+", category: "elektronik", subcategory: "cep-telefonu", price: 19500, image: "📱", desc: "Lüks vegan deri tasarım, 200MP kamera.", rating: 4.4, prices: generatePrices(19500) },
    { id: "poco-f5", name: "POCO F5", category: "elektronik", subcategory: "cep-telefonu", price: 21000, image: "📱", desc: "Snapdragon 7+ Gen 2, amiral gemisi performansı.", rating: 4.7, prices: generatePrices(21000) },
    { id: "samsung-a54", name: "Samsung Galaxy A54", category: "elektronik", subcategory: "cep-telefonu", price: 15000, image: "📱", desc: "Geceografi, uzun pil ömrü.", rating: 4.3, prices: generatePrices(15000) },
    { id: "iphone-11", name: "iPhone 11", category: "elektronik", subcategory: "cep-telefonu", price: 23000, image: "📱", desc: "Hala güçlü, hala renkli.", rating: 4.2, prices: generatePrices(23000) },
];
