'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Menu, Zap, X, ChevronRight, Home, Shirt, Tv, Armchair, ArrowRight, ExternalLink, Star, ShoppingBag, TrendingUp, Sun, Moon, MessageCircle, Plus, Check, ImageOff } from 'lucide-react';
import { ELECTRONICS_SUBCATEGORIES, PRODUCTS_DATA, generatePrices } from './data';
import { useComparison } from './context/ComparisonContext';
import Header from './components/Header';
import ComparisonBar from './components/ComparisonBar';
import Link from 'next/link';

// Typewriter Effect Component
const TypewriterText = ({ text }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let index = 0;
    setDisplayedText('');
    const interval = setInterval(() => {
      if (index < text.length - 1) {
        setDisplayedText((prev) => prev + text[index]);
        index++;
      } else {
        setDisplayedText(text); // Ensure full text at end
        clearInterval(interval);
      }
    }, 15); // Fast typing speed

    return () => clearInterval(interval);
  }, [text]);

  return <>{displayedText}</>;
};

const CategoryItem = ({ sub, isActive, onClick, count, image }) => {
  const [imgError, setImgError] = React.useState(false);

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-start p-4 rounded-2xl border transition-all duration-300 group ${isActive
        ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-950 shadow-md'
        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-xl hover:-translate-y-1'
        }`}
    >
      <div className="w-full h-32 mb-4 bg-white rounded-xl flex items-center justify-center p-2 overflow-hidden relative shadow-inner">
        {!imgError ? (
          <img
            src={image || sub.image}
            alt={sub.label}
            className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-500"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="text-6xl transform group-hover:scale-110 transition-transform duration-500 filter drop-shadow-lg text-slate-300">{sub.icon}</span>
        )}
        <div className="absolute inset-0 bg-transparent group-hover:bg-indigo-500/5 transition-colors"></div>
      </div>
      <h3 className={`text-sm font-bold text-center leading-tight ${isActive ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'}`}>
        {sub.label}
      </h3>
      <span className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">{count} Ürün</span>
    </button>
  );
};

// Reusable Product Card Component
const ProductCard = ({ product, isSelected, onToggleCompare, onClick, className = '', variant = 'card' }) => {
  const isList = variant === 'list';

  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-slate-900 rounded-2xl border shadow-sm hover:shadow-xl hover:shadow-indigo-100/50 dark:hover:shadow-indigo-900/20 hover:-translate-y-1.5 transition-all duration-300 group cursor-pointer relative overflow-hidden ${isSelected ? 'border-indigo-500 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-950' : 'border-slate-100 dark:border-slate-800'
        } ${isList ? 'flex flex-row items-stretch min-h-[140px] sm:flex-col sm:h-auto sm:items-stretch' : 'flex-col h-auto'} ${className}`}
    >
      <div className={`${isList ? 'w-32 shrink-0 border-r border-slate-50 dark:border-slate-800 sm:w-full sm:h-44 sm:border-r-0 sm:border-b' : 'w-full h-44'} bg-white flex items-center justify-center relative p-2 overflow-hidden`}>
        {product.image?.startsWith('http') ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-contain p-1 group-hover:scale-110 transition-transform duration-500" />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-300 dark:text-slate-600 scale-75">
            <ImageOff size={32} />
          </div>
        )}
      </div>

      <button
        className={`absolute top-2 right-2 sm:top-3 sm:right-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-1.5 sm:p-2 rounded-full shadow-sm transition-all z-10 border border-slate-100 dark:border-slate-700 ${isSelected
          ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 opacity-100'
          : 'text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 opacity-100 sm:opacity-0 sm:group-hover:opacity-100'
          }`}
        onClick={(e) => {
          e.stopPropagation();
          onToggleCompare(product);
        }}
        title={isSelected ? "Kıyaslamadan Çıkar" : "Kıyasla"}
      >
        {isSelected ? <Check size={14} /> : <Plus size={14} />}
      </button>

      <div className={`p-3 sm:p-4 flex flex-col justify-between flex-1 min-w-0 ${isList ? 'py-2' : ''}`}>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[9px] uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-900/50">
              {(product.subcategory || product.category || '').replace(/-/g, ' ')}
            </span>
            <div className="flex items-center gap-1 text-[9px] font-bold text-amber-500 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded-full border border-amber-100 dark:border-amber-900/50">
              <Star size={9} fill="currentColor" /> {Number(product.rating || 0).toFixed(1)}
            </div>
          </div>

          <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 mb-1">
            {product.name}
          </h3>
          <p className={`text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 ${isList ? 'block sm:hidden' : 'hidden'}`}>
            {product.desc}
          </p>
        </div>

        <div className={`flex items-end justify-between mt-auto ${isList ? 'pt-0 relative' : 'pt-3 border-t border-slate-50 dark:border-slate-800'}`}>
          <div className="flex flex-col">
            <span className="text-[10px] sm:text-xs text-red-600 dark:text-red-500 line-through mb-0.5 font-bold opacity-60">
              {Math.floor(product.price * 1.1).toLocaleString('tr-TR')} ₺
            </span>
            <span className="text-lg sm:text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none">
              {product.price.toLocaleString('tr-TR')} <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400">₺</span>
            </span>
            <span className="text-[9px] text-green-600 dark:text-green-400 font-bold mt-0.5 sm:hidden block">
              En Ucuz Fiyat
            </span>
            {isList && (
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 underline sm:hidden mt-2">
                Ürüne Git
              </span>
            )}
          </div>

          <div className={`flex items-center gap-2 ${isList ? 'mb-1 mr-[-6px]' : ''}`}>
            <div className={`w-10 h-10 rounded-full bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none group-hover:scale-110 transition-transform`}>
              <ArrowRight size={18} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ... imports

export default function ClientKiyasGo({ initialCategory = 'anasayfa', initialSubcategory = null, liveData = [] }) {
  const router = useRouter();
  const { addToComparison, selectedProducts, removeFromComparison } = useComparison();

  const [activeTab, setActiveTab] = useState(initialCategory);
  const [activeSubcategory, setActiveSubcategory] = useState(initialSubcategory);
  const [searchTerm, setSearchTerm] = useState("");

  // NOTE: Chat state is now handled globally in GlobalChat.js to support all pages.
  // We use the 'openChat' event to trigger it.

  const triggerChat = () => {
    window.dispatchEvent(new CustomEvent('openChat'));
  };

  const chatEndRef = useRef(null); // Keep if used elsewhere? No, it was for chat. Remove.

  // ... (mergedProducts logic) ...

  // ... (bestCategoryImages logic) ...

  useEffect(() => {
    setActiveSubcategory(initialSubcategory);
  }, [initialSubcategory]);

  const handleTabChange = (category) => {
    setActiveTab(category);
    setActiveSubcategory(null);
    if (category === 'anasayfa') {
      router.push('/');
    } else {
      router.push(`/${category}`);
    }
  };

  const handleSubcategoryClick = (subId) => {
    setActiveSubcategory(subId);
    router.push(`/${activeTab}/${subId}`);
  };

  const handleProductClick = (product) => {
    router.push(`/${product.category}/${product.subcategory || 'genel'}/${product.id}`);
  };

  const filteredProducts = React.useMemo(() => {
    return mergedProducts.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeTab === 'anasayfa' ? true : product.category === activeTab;
      const matchesSubcategory = activeSubcategory ? product.subcategory === activeSubcategory : true;

      if (activeTab === 'elektronik' && !activeSubcategory && !searchTerm) {
        return false;
      }

      return matchesSearch && matchesCategory && matchesSubcategory;
    });
  }, [mergedProducts, searchTerm, activeTab, activeSubcategory]);

  // HOMEPAGE STABLE LISTS
  const { homepagePopular, homepageWeekly } = React.useMemo(() => {
    // ... same logic ...
    const all = [...mergedProducts];
    const popular = [...all].sort((a, b) => {
      const valA = a.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const valB = b.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return (valA % 100) - (valB % 100) || valA - valB;
    }).slice(0, 5);

    const weekly = [...all].sort((a, b) => {
      const valA = a.id.split('').reverse().join('').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const valB = b.id.split('').reverse().join('').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return (valA % 100) - (valB % 100) || valA - valB;
    }).slice(5, 10);

    return { homepagePopular: popular, homepageWeekly: weekly };
  }, [mergedProducts]);


  // For Listing Pages / Search:
  const [displayProducts, setDisplayProducts] = useState([]);

  useEffect(() => {
    setDisplayProducts(filteredProducts);
  }, [filteredProducts]);

  const isHomepageView = activeTab === 'anasayfa' && !searchTerm;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 flex flex-col relative selection:bg-indigo-100 selection:text-indigo-700 dark:selection:bg-indigo-900 dark:selection:text-indigo-100 transition-colors duration-300">
      <Header
        activeTab={activeTab}
        onTabChange={handleTabChange}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onChatOpen={triggerChat}
        categoryImages={bestCategoryImages}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full pb-32">
        {/* Hero Section */}
        {isHomepageView && (
          <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-rose-500 dark:from-indigo-900 dark:via-purple-900 dark:to-rose-900 rounded-3xl p-8 md:p-12 mb-10 text-white flex justify-between items-center shadow-2xl shadow-indigo-900/20 relative overflow-hidden group transition-all duration-500">
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium mb-4 border border-white/20">
                <Star size={12} className="text-yellow-300 fill-yellow-300" />
                <span>Yapay Zeka Destekli Alışveriş Asistanı</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight tracking-tight">
                En İyi Fiyatı <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-orange-200">Saniyeler İçinde</span> Bul
              </h1>
              <p className="text-indigo-100 dark:text-indigo-200 max-w-lg text-base md:text-lg mb-8 leading-relaxed opacity-90">
                KıyasGO, binlerce mağazayı senin için tarar, analiz eder ve en uygun fiyatı karşına getirir. Fazla ödemeye son.
              </p>

              {/* UPDATED HERO BUTTONS */}
              <div className="flex w-full md:w-auto">
                <button onClick={triggerChat} className="w-full md:w-auto justify-center bg-white text-indigo-600 dark:bg-slate-900 dark:text-indigo-400 px-8 py-3.5 rounded-full font-bold hover:bg-indigo-50 dark:hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center gap-2 group-hover:gap-3">
                  Hemen Keşfet <ArrowRight size={18} />
                </button>
              </div>

            </div>
            <div className="absolute -right-10 -bottom-20 opacity-20 rotate-12 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 ease-out">
              <Zap size={350} fill="currentColor" />
            </div>
            <div className="absolute top-10 right-1/4 w-32 h-32 bg-rose-500 rounded-full blur-3xl opacity-30 animate-pulse"></div>
          </div>
        )}

        {/* Subcategories for Electronics */}
        {activeTab === 'elektronik' && !activeSubcategory && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Kategoriler</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {ELECTRONICS_SUBCATEGORIES.map((sub) => {
                const subProducts = mergedProducts.filter(p => p.subcategory === sub.id);
                // Sort by price descending to find the most expensive product
                const displayImage = bestCategoryImages[sub.id] || sub.image;

                return (
                  <CategoryItem
                    key={sub.id}
                    sub={sub}
                    isActive={activeSubcategory === sub.id}
                    onClick={() => handleSubcategoryClick(sub.id)}
                    count={subProducts.length}
                    image={displayImage}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* --- HOMEPAGE SPECIFIC SECTIONS --- */}
        {isHomepageView ? (
          <>
            {/* 1. SECTION: POPULAR */}
            <div className="flex items-center justify-between mb-4 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2 sm:gap-3 capitalize">
                <TrendingUp className="text-rose-500" />
                <span>Popüler Fırsatlar</span>
              </h2>
            </div>
            <div className="flex overflow-x-auto pb-4 gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 sm:gap-6 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide snap-x mb-8 sm:mb-12">
              {homepagePopular.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isSelected={selectedProducts.some(p => p.id === product.id)}
                  onClick={() => handleProductClick(product)}
                  onToggleCompare={(p) => selectedProducts.some(x => x.id === p.id) ? removeFromComparison(p.id) : addToComparison(p)}
                  className="min-w-[280px] sm:min-w-0 flex-shrink-0 snap-center"
                />
              ))}
            </div>

            {/* 2. SECTION: WEEKLY */}
            <div className="flex items-center justify-between mb-4 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2 sm:gap-3 capitalize">
                <Zap className="text-amber-500" />
                <span>Haftanın Ürünleri</span>
              </h2>
            </div>
            <div className="flex overflow-x-auto pb-4 gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 sm:gap-6 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide snap-x">
              {homepageWeekly.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isSelected={selectedProducts.some(p => p.id === product.id)}
                  onClick={() => handleProductClick(product)}
                  onToggleCompare={(p) => selectedProducts.some(x => x.id === p.id) ? removeFromComparison(p.id) : addToComparison(p)}
                  className="min-w-[280px] sm:min-w-0 flex-shrink-0 snap-center"
                />
              ))}
            </div>
          </>
        ) : (
          /* --- GENERIC GRID FOR SEARCH & LISTINGS --- */
          <>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3 capitalize">
                <span>
                  {activeTab.replace('-', ' & ')} Fırsatları
                  {activeSubcategory && <span className="text-slate-400 dark:text-slate-500 text-lg font-normal ml-2">/ {ELECTRONICS_SUBCATEGORIES.find(s => s.id === activeSubcategory)?.label}</span>}
                </span>
              </h2>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
                {displayProducts.length} ürün listelendi
              </span>
            </div>

            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 ${isHomepageView ? '' : 'flex flex-col gap-4 sm:grid'}`}>
              {displayProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  variant={!isHomepageView ? 'list' : 'card'}
                  product={product}
                  isSelected={selectedProducts.some(p => p.id === product.id)}
                  onClick={() => handleProductClick(product)}
                  onToggleCompare={(p) => selectedProducts.some(x => x.id === p.id) ? removeFromComparison(p.id) : addToComparison(p)}
                />
              ))}
            </div>
          </>
        )}
      </main>

      <ComparisonBar />
    </div>
  );
}