'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Menu, Zap, X, ChevronRight, Home, Shirt, Tv, Armchair, ArrowRight, ExternalLink, Star, ShoppingBag, TrendingUp, Sun, Moon, MessageCircle, Plus, Check, ImageOff, Heart, ChevronDown } from 'lucide-react';
import { ELECTRONICS_SUBCATEGORIES, HOME_OFFICE_SUBCATEGORIES, POPULAR_BRANDS, PRODUCTS_DATA, generatePrices } from './data';
import { useComparison } from './context/ComparisonContext';
import Header from './components/Header';
import ComparisonBar from './components/ComparisonBar';
import Link from 'next/link';

import { createClient } from '@/app/utils/supabase/client';
import AuthModal from './components/AuthModal';
import ProductCard from './components/ProductCard';
import PopularBrands from './components/PopularBrands';
import Toast from './components/Toast';
import HomeSEOContent from './components/HomeSEOContent';
import FilterSidebar from './components/FilterSidebar';
import { useAuth } from '@/app/context/AuthContext';
import { useFavorites } from '@/app/context/FavoritesContext';

// Turkish-compatible Slugify
const slugify = (text) => {
  if (!text) return '';
  try {
    text = decodeURIComponent(text); // Handle %20 -> space
  } catch (e) {
    // ignore
  }
  const trMap = {
    'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
    'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u'
  };
  return text.toString()
    .replace(/[çğıöşüÇĞİÖŞÜ]/g, match => trMap[match])
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-');
};

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

  if (!sub) return null;

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
            src={image || sub?.image}
            alt={sub?.label || 'Kategori'}
            className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-500"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="text-6xl transform group-hover:scale-110 transition-transform duration-500 filter drop-shadow-lg text-slate-300">{sub.icon}</span>
        )}
        <div className="absolute inset-0 bg-transparent group-hover:bg-indigo-500/5 transition-colors"></div>
      </div>
      <h3 className={`text-base font-bold text-center leading-tight mb-1 ${isActive ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'}`}>
        {sub.label}
      </h3>
      {sub.description && (
        <span className="text-[10px] text-slate-400 dark:text-slate-500 text-center leading-tight line-clamp-2 px-2 hidden md:block group-hover:text-indigo-500/80 transition-colors">
          {sub.description}
        </span>
      )}
      <span className="text-xs text-slate-400 dark:text-slate-500 mt-2 font-medium bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-full">{count} Ürün</span>
    </button>
  );
};



export default function ClientKiyasGo({ initialCategory = 'anasayfa', initialSubcategory = null, liveData = [] }) {
  const router = useRouter();
  const { addToComparison, selectedProducts, removeFromComparison } = useComparison();
  const [activeTab, setActiveTab] = useState(initialCategory);
  const [activeSubcategory, setActiveSubcategory] = useState(initialSubcategory);
  // Search state removed - Search is now handled globally via /arama page
  const [sortOption, setSortOption] = useState('popularity');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Filters
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [selectedStorage, setSelectedStorage] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({});
  const itemsPerPage = 100;

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Use Centralized Auth
  const { user } = useAuth();

  // Use Centralized Favorites
  const { isFavorite, toggleFavorite } = useFavorites();

  const [toast, setToast] = useState(null);

  // Handle favorite toggle with centralized context
  const handleToggleFavorite = async (product) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    const result = await toggleFavorite(product.id, (type) => {
      if (type === 'add') {
        setToast({ message: "Favorilere eklendi! ❤️", type: 'success' });
      } else {
        setToast({ message: "Favorilerden kaldırıldı.", type: 'remove' });
      }
    });

    if (!result.success && result.needsAuth) {
      setIsAuthModalOpen(true);
    }
  };
  // NOTE: Chat state is now handled globally in GlobalChat.js to support all pages.
  // We use the 'openChat' event to trigger it.

  const triggerChat = () => {
    window.dispatchEvent(new CustomEvent('openChat'));
  };

  // Merge Static Data with Live Data
  // FIX: Prioritize Live Data completely to avoid ghost products (deleted generics)
  // If we have live data from DB, we ignore static data to ensure UI matches DB exactly.
  const mergedProducts = React.useMemo(() => {
    if (liveData && liveData.length > 0) {
      return liveData.filter(live => !!live).map(live => ({
        ...live,
        id: live.slug || (live.name || '').toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '') || 'unknown-id',
        image: live.image || live.image1 || "https://example.com/placeholder.jpg",
        desc: live.desc || 'Ürün açıklaması yakında eklenecek.',
        rating: live.rating || 4.5,
        category: live.category || 'elektronik',
        subcategory: (live.subcategory || 'cep-telefonu').toLowerCase().trim().replace(/ /g, '-'), // Normalize subcategory
        prices: live.stores || generatePrices(live.price || 0),
        price: live.price || 0, // Enforce price default
      }));
    }
    return PRODUCTS_DATA;
  }, [liveData]);

  // Compute Best Images for Mega Menu (Most expensive product's image per ID)
  const bestCategoryImages = React.useMemo(() => {
    const images = {};

    // 1. For each granular subcategory (cep-telefonu, televizyon, etc.), find the most expensive product
    mergedProducts.forEach(p => {
      if (!p) return;
      const subId = p.subcategory;
      if (!images[subId] || p.price > images[subId].price) {
        images[subId] = { price: p.price, image: p.image };
      }
    });

    // 2. Unpack the object to just return image URLs
    const finalImages = {};
    Object.keys(images).forEach(key => {
      if (images[key]) {
        finalImages[key] = images[key].image;
      }
    });

    return finalImages;
  }, [mergedProducts]);

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
    router.push(`/${subId}`);
  };

  const handleProductClick = (product) => {
    // Generate clean slug from name (reliable) or clean up existing slug
    const rawSlug = product.slug || product.name;
    const cleanSlug = slugify(rawSlug);
    const sub = product.subcategory ? slugify(product.subcategory) : 'genel';
    // NEW URL FORMAT: /subcategory/en-ucuz-cleanSlug-fiyati
    router.push(`/${sub}/en-ucuz-${cleanSlug}-fiyati`);
  };

  const searchParams = useSearchParams();
  const brandParam = searchParams.get('brand');

  const filteredProducts = React.useMemo(() => {
    return mergedProducts.filter(product => {
      // Search is now handled in /arama page, no live filtering on homepage
      // const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSearch = true;

      const matchesCategory = activeTab === 'anasayfa' ? true : product.category === activeTab;

      let matchesSubcategory = true;
      if (activeSubcategory) {
        // Find the active Main Category definition
        const activeCatObj = ELECTRONICS_SUBCATEGORIES.find(s => s.id === activeSubcategory);
        if (activeCatObj && activeCatObj.subIds) {
          // Check if product's subcategory is in the allowed list for this Parent Category
          matchesSubcategory = activeCatObj.subIds.includes(product.subcategory);
        } else {
          // Fallback for direct match
          matchesSubcategory = product.subcategory === activeSubcategory;
        }
      }

      // Brand Filter Logic
      let matchesBrand = true;
      if (brandParam) {
        matchesBrand = product.name.toLowerCase().includes(brandParam.toLowerCase());
      }

      // Price Filter
      let matchesPrice = true;
      if (priceRange.min !== '' && product.price < parseFloat(priceRange.min)) matchesPrice = false;
      if (priceRange.max !== '' && product.price > parseFloat(priceRange.max)) matchesPrice = false;

      // Storage Filter (Mock)
      let matchesStorage = true;
      if (selectedStorage.length > 0) {
        matchesStorage = false;
        const descLower = product.desc?.toLowerCase() || '';
        const nameLower = product.name?.toLowerCase() || '';
        // Check if any selected storage string is in name or desc
        if (selectedStorage.some(s => nameLower.includes(s.toLowerCase()) || descLower.includes(s.toLowerCase()))) {
          matchesStorage = true;
        }
      }

      return matchesSearch && matchesCategory && matchesSubcategory && matchesBrand && matchesPrice && matchesStorage;
    });
  }, [mergedProducts, activeTab, activeSubcategory, brandParam, priceRange, selectedStorage]);

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

  const isHomepageView = activeTab === 'anasayfa';
  // Check if active subcategory is a Parent with children
  const activeParentCategory = React.useMemo(() => {
    return ELECTRONICS_SUBCATEGORIES.find(s => s.id === activeSubcategory && s.children);
  }, [activeSubcategory]);

  // --- GRID LOGIC: SORTING & PAGINATION ---
  const { sortedProducts, totalPages, currentPaginatedProducts, isRestrictedView } = React.useMemo(() => {
    let sorted = [...displayProducts];
    if (sortOption === 'price-asc') sorted.sort((a, b) => a.price - b.price);
    else if (sortOption === 'price-desc') sorted.sort((a, b) => b.price - a.price);
    else if (sortOption === 'rating') sorted.sort((a, b) => b.rating - a.rating);

    const total = Math.ceil(sorted.length / itemsPerPage);

    // Check if we should restrict view to just Top 5 (Parent or Root category)
    const isRestrictedView = (!activeSubcategory || !!activeParentCategory) && !brandParam;

    // Limit Logic for Parent/Root Category
    let paginated = sorted;
    if (isRestrictedView) {
      paginated = sorted.slice(0, 5);
    } else {
      paginated = sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    }

    return { sortedProducts: sorted, totalPages: total, currentPaginatedProducts: paginated, isRestrictedView };
  }, [displayProducts, sortOption, currentPage, activeParentCategory, activeSubcategory, brandParam]);

  return (
    <div className="min-h-screen bg-transparent font-sans text-slate-800 dark:text-slate-100 flex flex-col relative selection:bg-indigo-100 selection:text-indigo-700 dark:selection:bg-indigo-900 dark:selection:text-indigo-100 transition-colors duration-300">
      <Header
        activeTab={activeTab}
        onTabChange={handleTabChange}
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
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4"> {/* Compact Grid: 3-cols mobile */}
              {ELECTRONICS_SUBCATEGORIES.filter(sub => !!sub).map((sub) => {
                const subProducts = mergedProducts.filter(p => {
                  if (sub.subIds) return sub.subIds.includes(p.subcategory);
                  return p.subcategory === sub.id;
                });
                const displayImage = bestCategoryImages[sub.id] || sub?.image;

                return (
                  <CategoryItem
                    key={sub.id}
                    sub={sub}
                    isActive={activeSubcategory === sub.id || sub.subIds?.includes(activeSubcategory)}
                    onClick={() => handleSubcategoryClick(sub.id)}
                    count={subProducts.length}
                    image={displayImage}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Subcategories for Home & Office */}
        {
          activeTab === 'ev-yasam' && !activeSubcategory && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Ev, Ofis, Yaşam Kategorileri</h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4"> {/* Compact Grid: 3-cols mobile */}
                {HOME_OFFICE_SUBCATEGORIES.filter(sub => !!sub).map((sub) => {
                  const subProducts = mergedProducts.filter(p => {
                    if (sub.subIds && sub.subIds.length > 0) return sub.subIds.includes(p.subcategory);
                    return p.subcategory === sub.id;
                  });
                  const displayImage = bestCategoryImages[sub.id] || sub?.image;

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
          )
        }

        {/* --- NEW: Child Categories Grid (e.g. Inside "Telefon...") --- */}
        {
          activeParentCategory && (
            <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                {activeParentCategory.label} Kategori ve Ürünleri
                <span className="text-xs font-normal text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                  {mergedProducts.filter(p => activeParentCategory.subIds.includes(p.subcategory)).length} Ürün
                </span>
              </h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3"> {/* Compact Grid: 3-cols mobile */}
                {activeParentCategory.children && activeParentCategory.children.filter(child => !!child).map(child => {
                  const childCount = mergedProducts.filter(p => p.subcategory === child.id).length;
                  return (
                    <button
                      key={child.id}
                      onClick={() => router.push(`/${child.id}`)}
                      className="flex flex-col items-center p-2 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-lg hover:-translate-y-1 transition-all group h-full"
                    >
                      <div className="w-full h-16 mb-2 flex items-center justify-center p-1 bg-slate-50 dark:bg-slate-800 rounded-lg overflow-hidden">
                        <img src={child.image} alt={child.label} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-110 transition-transform" />
                      </div>
                      <h3 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 text-center leading-tight mb-0.5 group-hover:underline">
                        {child.label}
                      </h3>
                      <span className="text-[9px] text-slate-400 font-medium bg-slate-50 dark:bg-slate-800 px-1 py-0.5 rounded-full">
                        {childCount}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        }

        {/* --- HOMEPAGE SPECIFIC SECTIONS --- */}
        {
          isHomepageView ? (
            <>
              {/* 1. SECTION: POPULAR */}
              <div className="flex items-center justify-between mb-4 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2 sm:gap-3 capitalize">
                  <TrendingUp className="text-rose-500" />
                  <span>Popüler Fırsatlar</span>
                </h2>
              </div>
              <div className="flex overflow-x-auto pb-4 gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 sm:gap-6 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide snap-x mb-8 sm:mb-12">
                {homepagePopular.map((product) => product ? (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isSelected={selectedProducts.some(p => p.id === product.id)}
                    onClick={() => handleProductClick(product)}
                    onToggleCompare={(p) => selectedProducts.some(x => x.id === p.id) ? removeFromComparison(p.id) : addToComparison(p)}
                    onToggleFavorite={handleToggleFavorite}
                    isFavorite={isFavorite(product.id)}
                    className="min-w-[220px] sm:min-w-0 flex-shrink-0 snap-center"
                  />
                ) : null)}
              </div>

              {/* 2. SECTION: WEEKLY */}
              <div className="flex items-center justify-between mb-4 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2 sm:gap-3 capitalize">
                  <Zap className="text-amber-600" />
                  <span>Haftanın Ürünleri</span>
                </h2>
              </div>
              <div className="flex overflow-x-auto pb-4 gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 sm:gap-6 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide snap-x">
                {homepageWeekly.map((product) => product ? (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isSelected={selectedProducts.some(p => p.id === product.id)}
                    onClick={() => handleProductClick(product)}
                    onToggleCompare={(p) => selectedProducts.some(x => x.id === p.id) ? removeFromComparison(p.id) : addToComparison(p)}
                    onToggleFavorite={handleToggleFavorite}
                    isFavorite={isFavorite(product.id)}
                    className="min-w-[220px] sm:min-w-0 flex-shrink-0 snap-center"
                  />
                ) : null)}
              </div>

              {/* --- POPULAR BRANDS SECTION --- */}
              <PopularBrands
                brands={POPULAR_BRANDS}
                onSubCategoryClick={(brand, cat) => {
                  // Redirect to /arama with query
                  const query = `${brand} ${cat}`;
                  router.push(`/arama?q=${encodeURIComponent(query)}`);
                }}
                onViewAll={() => {
                  // Open Filter Modal to show all options or navigate
                  setIsFilterModalOpen(true);
                }}
              />
              {/* --- SEO CONTENT SECTION --- */}
              <HomeSEOContent />
            </>
          ) : (
            /* --- GENERIC GRID FOR SEARCH & LISTINGS --- */
            <div className="flex flex-col lg:flex-row gap-8 items-start">

              {/* --- FILTER MODAL (MOBILE) --- */}
              {
                isFilterModalOpen && (
                  <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-2xl relative animate-in slide-in-from-bottom-10">
                      <button
                        onClick={() => setIsFilterModalOpen(false)}
                        className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-800 rounded-full"
                      >
                        <X size={20} />
                      </button>
                      <h2 className="text-xl font-bold mb-6">Filtrele & Sırala</h2>
                      <FilterSidebar
                        activeTab={activeTab}
                        activeSubcategory={activeSubcategory}
                        priceRange={priceRange}
                        setPriceRange={setPriceRange}
                        selectedFilters={selectedFilters}
                        setSelectedFilters={setSelectedFilters}
                        router={router}
                        searchParams={searchParams}
                        mergedProducts={mergedProducts}
                        onClose={() => setIsFilterModalOpen(false)}
                      />
                    </div>
                  </div>
                )
              }

              {/* --- SIDEBAR FILTERS (Hidden in Restricted View) --- */}
              {!isRestrictedView && (
                <aside className="w-full lg:w-64 shrink-0 hidden lg:block sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto filter-scrollbar pr-2">
                  <FilterSidebar
                    activeTab={activeTab}
                    activeSubcategory={activeSubcategory}
                    priceRange={priceRange}
                    setPriceRange={setPriceRange}
                    selectedFilters={selectedFilters}
                    setSelectedFilters={setSelectedFilters}
                    router={router}
                    searchParams={searchParams}
                    mergedProducts={mergedProducts}
                  />
                </aside>
              )}

              <div className="flex-1 w-full">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4 bg-white dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3 capitalize">
                    <span>
                      {activeTab.replace('-', ' & ')} {isRestrictedView ? 'En Popüler Ürünler' : 'Fırsatları'}
                      {activeSubcategory && (
                        <span className="text-slate-400 dark:text-slate-500 text-lg font-normal ml-2">
                          / {
                            (() => {
                              const allCats = [];
                              ELECTRONICS_SUBCATEGORIES.forEach(c => {
                                allCats.push(c);
                                if (c.children) allCats.push(...c.children);
                              });
                              return allCats.find(s => s.id === activeSubcategory)?.label || activeSubcategory;
                            })()
                          }
                        </span>
                      )}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 ml-2">
                      {displayProducts.length} ürün
                    </span>
                  </h2>

                  <div className="flex items-center gap-2">
                    {/* MOBILE FILTER BUTTON */}
                    <button
                      onClick={() => setIsFilterModalOpen(true)}
                      className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium hover:border-indigo-500 transition-colors shadow-sm"
                    >
                      <Menu size={16} /> Filtrele
                    </button>

                    {/* SORTING DROPDOWN (Hidden in Restricted View) */}
                    {!isRestrictedView && (
                      <div className="relative group min-w-[180px] z-20">
                        <button
                          onClick={() => setIsSortOpen(!isSortOpen)}
                          className="w-full flex items-center justify-between gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors shadow-sm"
                        >
                          <span>
                            {sortOption === 'popularity' && 'Sırala: Popülerlik'}
                            {sortOption === 'price-asc' && 'En Düşük Fiyat'}
                            {sortOption === 'price-desc' && 'En Yüksek Fiyat'}
                            {sortOption === 'rating' && 'En Yüksek Puan'}
                            {sortOption === 'newest' && 'En Yeniler'}
                          </span>
                          <ChevronDown size={16} className={`transition-transform duration-200 ${isSortOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isSortOpen && (
                          <div className="absolute top-full right-0 mt-2 w-full bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden animate-in fade-in slide-in-from-top-2 p-1">
                            {[
                              { id: 'popularity', label: 'Popülerlik' },
                              { id: 'price-asc', label: 'En Düşük Fiyat' },
                              { id: 'price-desc', label: 'En Yüksek Fiyat' },
                              { id: 'rating', label: 'En Yüksek Puan' },
                              { id: 'newest', label: 'En Yeniler' }
                            ].map((opt) => (
                              <button
                                key={opt.id}
                                onClick={() => { setSortOption(opt.id); setIsSortOpen(false); setCurrentPage(1); }}
                                className={`w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 ${sortOption === opt.id ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold ring-1 ring-indigo-200 dark:ring-indigo-800' : 'text-slate-700 dark:text-slate-300'}`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* PRODUCT GRID (From Logic) */}
                <div className={`
                  ${isRestrictedView
                    ? 'flex overflow-x-auto pb-4 gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-5 sm:gap-6 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide snap-x'
                    : ((!!activeSubcategory || !!brandParam) ? 'grid grid-cols-1 gap-4 lg:flex lg:flex-col' : 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6')
                  // REVERTED: Back to original Logic (List for Subcats, Grid for Dashboard/General)
                  }
                `}>
                  {currentPaginatedProducts.map((product) => product ? (
                    <ProductCard
                      key={product.id}
                      variant={(isRestrictedView) ? 'card' : (!!activeSubcategory || !!brandParam ? 'detailed-list' : 'card')} // REVERTED variant logic
                      product={product}
                      isSelected={selectedProducts.some(p => p.id === product.id)}
                      onClick={() => handleProductClick(product)}
                      onToggleCompare={(p) => selectedProducts.some(x => x.id === p.id) ? removeFromComparison(p.id) : addToComparison(p)}
                      onToggleFavorite={handleToggleFavorite}
                      isFavorite={isFavorite(product.id)}
                      className={isRestrictedView ? "min-w-[220px] sm:min-w-0 flex-shrink-0 snap-center" : ""}
                    />
                  ) : null)}
                </div>

                {/* PAGINATION CONTROLS */}
                {(totalPages > 1 && !isRestrictedView) && (
                  <div className="flex justify-center items-center mt-12 gap-2">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <ChevronDown className="rotate-90" size={20} />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-lg border text-sm font-bold transition-colors ${currentPage === page
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200 dark:shadow-none'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-indigo-300'}`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <ChevronDown className="-rotate-90" size={20} />
                    </button>
                  </div>
                )}
              </div>
            </div >
          )
        }
      </main >

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <ComparisonBar />
    </div >
  );
}