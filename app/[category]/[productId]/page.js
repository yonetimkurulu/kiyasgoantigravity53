'use client';

import React from 'react';
import { Star, Truck, ShieldCheck, ArrowLeft, ShoppingCart, Zap } from 'lucide-react';
import Link from 'next/link';
import AIRecommendation from '@/app/components/AIRecommendation';


const generatePrices = (basePrice) => [
  { store: "Trendyol", price: basePrice, color: "text-orange-600" },
  { store: "Hepsiburada", price: basePrice - 500, color: "text-orange-500" },
  { store: "Amazon", price: basePrice + 250, color: "text-yellow-600" },
  { store: "N11", price: basePrice + 100, color: "text-purple-600" },
  { store: "MediaMarkt", price: basePrice + 1000, color: "text-red-600" },
];

const PRODUCTS_DATA = [
  { id: "iphone-15-pro", name: "iPhone 15 Pro", category: "elektronik", price: 75000, image: "📱", desc: "Titanyum tasarım, A17 Pro çip.", rating: 4.8, prices: generatePrices(75000) },
  { id: "samsung-s24-ultra", name: "Samsung S24 Ultra", category: "elektronik", price: 72000, image: "📱", desc: "Galaxy AI özellikleri, 200MP kamera.", rating: 4.7, prices: generatePrices(72000) },
  { id: "dyson-v15", name: "Dyson V15", category: "ev-yasam", price: 25000, image: "🧹", desc: "Lazer teknolojili kablosuz süpürge.", rating: 4.9, prices: generatePrices(25000) },
  { id: "nike-air-max", name: "Nike Air Max", category: "moda", price: 4500, image: "👟", desc: "Günlük kullanım için ikonik tasarım.", rating: 4.5, prices: generatePrices(4500) },
  { id: "sony-wh-1000xm5", name: "Sony WH-1000XM5", category: "elektronik", price: 12000, image: "🎧", desc: "Endüstri lideri gürültü engelleme.", rating: 4.6, prices: generatePrices(12000) },
  { id: "zara-blazer", name: "Zara Blazer Ceket", category: "moda", price: 3200, image: "🧥", desc: "Ofis şıklığı için modern kesim.", rating: 4.3, prices: generatePrices(3200) },
  { id: "philips-airfryer", name: "Philips Airfryer XXL", category: "ev-yasam", price: 8500, image: "🍟", desc: "Az yağ ile çıtır lezzetler.", rating: 4.8, prices: generatePrices(8500) },
  { id: "macbook-air-m2", name: "MacBook Air M2", category: "elektronik", price: 42000, image: "💻", desc: "İnce, hafif ve güçlü M2 işlemci.", rating: 4.9, prices: generatePrices(42000) },
];

export default function ProductDetailPage({ params }) {

  const productId = params?.productId;
  const product = PRODUCTS_DATA.find(p => p.id === productId);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 font-sans">
        <h1 className="text-2xl font-bold text-gray-800">Ürün Bulunamadı</h1>
        <Link href="/" className="mt-4 text-blue-600 hover:underline">Ana Sayfaya Dön</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-20">

      {/* Üst Menü */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-50 flex items-center gap-4 shadow-sm">
        <Link href="/" className="p-2 hover:bg-gray-100 rounded-full transition text-gray-600">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="font-bold text-lg truncate text-gray-800">{product.name}</h1>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Ürün Kartı */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden md:flex mb-8">
          <div className="bg-gray-50 p-10 flex items-center justify-center md:w-1/2 min-h-[300px]">
            <div className="text-9xl transform hover:scale-110 transition-transform duration-500">{product.image}</div>
          </div>
          <div className="p-8 md:w-1/2 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold uppercase bg-blue-100 text-blue-700 px-2.5 py-1 rounded-md tracking-wide">{product.category}</span>
              <div className="flex items-center gap-1 text-orange-500 text-sm font-bold bg-orange-50 px-2 py-1 rounded-md">
                <Star size={14} fill="currentColor" /> {product.rating}
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 leading-tight">{product.name}</h1>
            <p className="text-gray-600 mb-8 leading-relaxed">{product.desc} Yüksek performanslı donanımı ve kullanıcı dostu özellikleriyle öne çıkan bu ürün, kendi kategorisindeki en iyi fiyat/performans oranına sahip seçeneklerden biridir.</p>

            <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">En İyi Fiyat</p>
                <p className="text-3xl font-black text-gray-900 tracking-tight">{product.price.toLocaleString('tr-TR')} ₺</p>
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all transform active:scale-95">
                <Zap size={20} /> Kıyasla
              </button>
            </div>
          </div>
        </div>

        {/* AI Recommendation */}
        <AIRecommendation productId={product.id} />

        {/* Fiyat Listesi */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2 px-1">
            <ShoppingCart size={22} className="text-blue-600" /> Mağaza Fiyatları
          </h2>
          <div className="space-y-3">
            {product.prices.map((offer, i) => (
              <div key={i} className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 group-hover:bg-blue-600 group-hover:text-white transition-colors">{i + 1}</div>
                  <div>
                    <p className={`font-bold text-lg ${offer.color}`}>{offer.store}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                      <span className="flex items-center gap-1"><Truck size={12} /> Kargo Bedava</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span className="flex items-center gap-1"><ShieldCheck size={12} /> Garantili</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900">{offer.price.toLocaleString('tr-TR')} ₺</p>
                  <span className="text-xs text-blue-600 font-bold group-hover:underline flex items-center justify-end gap-1">
                    Mağazaya Git <ArrowLeft size={12} className="rotate-180" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}