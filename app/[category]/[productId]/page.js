'use client';

import React, { useState, useEffect } from 'react';
import { Star, Truck, ShieldCheck, ArrowLeft, ShoppingCart, Zap, Home, Tv, Shirt, Armchair, Search, Menu, Sun, Moon, ArrowRight, MessageCircle, X } from 'lucide-react';
import Link from 'next/link';
import AIRecommendation from '@/app/components/AIRecommendation';
import { ELECTRONICS_SUBCATEGORIES, PRODUCTS_DATA } from '../../data';
import ClientKiyasGo from '../../ClientKiyasGo';

export default function ProductDetailPage({ params }) {
  const [theme, setTheme] = useState('light');
  const productId = params?.productId;
  const category = params?.category;

  // Check if the current route is actually a subcategory
  const isSubcategory = ELECTRONICS_SUBCATEGORIES.some(sub => sub.id === productId);

  useEffect(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }
  };

  const NavButton = ({ label, icon: Icon }) => (
    <Link
      href="/"
      className="flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-300 whitespace-nowrap font-medium text-sm text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400"
    >
      <Icon size={18} />
      <span className="md:inline">{label}</span>
    </Link>
  );

  // If it's a subcategory, render the main client component with the subcategory selected
  if (isSubcategory) {
    return <ClientKiyasGo initialCategory={category} initialSubcategory={productId} />;
  }

  const product = PRODUCTS_DATA.find(p => p.id === productId);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Ürün Bulunamadı</h1>
        <Link href="/" className="mt-4 text-indigo-600 dark:text-indigo-400 hover:underline">Ana Sayfaya Dön</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 pb-20 transition-colors duration-300">

      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex justify-between items-center w-full md:w-auto">
              <div className="flex items-center gap-8">
                <Link href="/" className="text-2xl font-black tracking-tight flex items-center gap-1 group">
                  <span className="text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">Kıyas</span>
                  <span className="bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-transparent group-hover:rotate-3 transition-transform inline-block">GO</span>
                </Link>
                <nav className="hidden md:flex gap-1 bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-full border border-slate-200/50 dark:border-slate-700/50">
                  <NavButton label="Vitrin" icon={Home} />
                  <NavButton label="Elektronik" icon={Tv} />
                  <NavButton label="Moda" icon={Shirt} />
                  <NavButton label="Ev & Yaşam" icon={Armchair} />
                </nav>
              </div>
              <div className="flex items-center gap-2 md:hidden">
                <button onClick={toggleTheme} className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                  {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </button>
                <button className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"><Menu size={24} /></button>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative w-full md:max-w-xs group flex-1">
                <input
                  type="text"
                  placeholder="Ürün, marka veya kategori ara..."
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 border border-transparent focus:border-indigo-500 dark:focus:border-indigo-400 rounded-full text-sm outline-none transition-all shadow-sm focus:shadow-md text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
                <Search className="absolute left-4 top-2.5 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors" size={18} />
              </div>

              <button
                onClick={toggleTheme}
                className="hidden md:flex p-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-full transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                title={theme === 'light' ? "Karanlık Mod" : "Aydınlık Mod"}
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Breadcrumb / Back */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium">
            <ArrowLeft size={18} /> Ana Sayfaya Dön
          </Link>
        </div>

        {/* Ürün Kartı */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-indigo-100/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden md:flex mb-10 transition-colors duration-300">
          <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 p-10 flex items-center justify-center md:w-1/2 min-h-[350px] relative">
            <div className="text-9xl transform hover:scale-110 transition-transform duration-500 drop-shadow-2xl">{product.image}</div>
            <div className="absolute top-4 left-4">
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-1 rounded-md border border-indigo-100 dark:border-indigo-900/50">
                {product.category}
              </span>
            </div>
          </div>
          <div className="p-8 md:w-1/2 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1 text-amber-500 dark:text-amber-400 text-sm font-bold bg-amber-50 dark:bg-amber-900/30 px-3 py-1 rounded-full border border-amber-100 dark:border-amber-900/50">
                <Star size={14} fill="currentColor" /> {product.rating}
              </div>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">120+ Değerlendirme</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4 leading-tight">{product.name}</h1>
            <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed text-lg">{product.desc} Yüksek performanslı donanımı ve kullanıcı dostu özellikleriyle öne çıkan bu ürün, kendi kategorisindeki en iyi fiyat/performans oranına sahip seçeneklerden biridir.</p>

            <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1 uppercase tracking-wide">En İyi Fiyat</p>
                <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{product.price.toLocaleString('tr-TR')} <span className="text-lg text-slate-500 dark:text-slate-400 font-bold">₺</span></p>
              </div>
              <button className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none hover:shadow-xl hover:-translate-y-1 transition-all transform active:scale-95">
                <Zap size={20} fill="currentColor" /> Kıyasla
              </button>
            </div>
          </div>
        </div>

        {/* AI Recommendation */}
        <div className="mb-10">
          <AIRecommendation productId={product.id} />
        </div>

        {/* Fiyat Listesi */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3 px-1">
            <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-lg text-indigo-600 dark:text-indigo-400"><ShoppingCart size={24} /></div>
            Mağaza Fiyatları
          </h2>
          <div className="space-y-4">
            {product.prices.map((offer, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all cursor-pointer group">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 dark:text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors text-lg">{i + 1}</div>
                  <div>
                    <p className={`font-bold text-xl ${offer.color}`}>{offer.store}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500 mt-1.5 font-medium">
                      <span className="flex items-center gap-1.5"><Truck size={14} /> Kargo Bedava</span>
                      <span className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full"></span>
                      <span className="flex items-center gap-1.5"><ShieldCheck size={14} /> Garantili</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-slate-900 dark:text-white">{offer.price.toLocaleString('tr-TR')} <span className="text-sm font-bold text-slate-400">₺</span></p>
                  <span className="text-sm text-indigo-600 dark:text-indigo-400 font-bold group-hover:underline flex items-center justify-end gap-1 mt-1">
                    Mağazaya Git <ArrowRight size={14} />
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