'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Menu, Zap, X, ChevronRight, Home, Shirt, Tv, Armchair, ArrowRight, ExternalLink, Star, ShoppingBag, TrendingUp, Sun, Moon, MessageCircle, Plus, Check, ImageOff, Heart, ChevronDown } from 'lucide-react';
import { ELECTRONICS_SUBCATEGORIES, HOME_OFFICE_SUBCATEGORIES, PRODUCTS_DATA, generatePrices } from './data';
import { useComparison } from './context/ComparisonContext';
import Header from './components/Header';
import ComparisonBar from './components/ComparisonBar';
import Link from 'next/link';

import { createClient } from '@/app/utils/supabase/client';
import AuthModal from './components/AuthModal';
import ProductCard from './components/ProductCard';
import Toast from './components/Toast';
import { useAuth } from '@/app/context/AuthContext';

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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

  // Favorites State
  const [favorites, setFavorites] = useState(new Set());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Use Centralized Auth
  const { user, supabase } = useAuth();

  const [toast, setToast] = useState(null);

  useEffect(() => {
    // Fetch Favorites when user changes
    const fetchFavorites = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('favorites')
          .select('product_id');

        if (data && !error) {
          setFavorites(new Set(data.map(f => f.product_id)));
        }
      }
    };
    fetchFavorites();
  }, [user]);

  const handleToggleFavorite = async (product) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    const productId = product.id.toString(); // Ensure string for consistency
    const isFav = favorites.has(productId);

    // Optimistic Update
    setFavorites(prev => {
      const next = new Set(prev);
      if (isFav) {
        next.delete(productId);
        setToast({ message: "Favorilerden kaldırıldı.", type: 'remove' });
      } else {
        next.add(productId);
        setToast({ message: "Favorilere eklendi! ❤️", type: 'success' });
      }
      return next;
    });

    try {
      if (isFav) {
        await supabase.from('favorites').delete().eq('user_id', user.id).eq('product_id', productId);
      } else {
        // Check existence logic handled by simple insert, assuming composite key or RLS
        // But simple delete/insert works for toggling
        await supabase.from('favorites').insert({ user_id: user.id, product_id: productId });
      }
    } catch (err) {
      console.error("Favorite error:", err);
      // Rollback (optional, skipping for simplicity)
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
        // Simple containment check, robust enough for "Samsung" matching "Samsung Galaxy..."
        matchesBrand = product.name.toLowerCase().includes(brandParam.toLowerCase());
      }



      return matchesSearch && matchesCategory && matchesSubcategory && matchesBrand;
    });
  }, [mergedProducts, /* searchTerm, */ activeTab, activeSubcategory, brandParam]);

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
  const { sortedProducts, totalPages, currentPaginatedProducts } = React.useMemo(() => {
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {ELECTRONICS_SUBCATEGORIES.filter(sub => !!sub).map((sub) => {
                const subProducts = mergedProducts.filter(p => {
                  if (sub.subIds) return sub.subIds.includes(p.subcategory);
                  return p.subcategory === sub.id;
                });
                // Sort by price descending to find the most expensive product
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {activeParentCategory.children && activeParentCategory.children.filter(child => !!child).map(child => {
                  const childCount = mergedProducts.filter(p => p.subcategory === child.id).length;
                  return (
                    <button
                      key={child.id}
                      onClick={() => router.push(`/${child.id}`)}
                      className="flex flex-col items-center p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-lg hover:-translate-y-1 transition-all group h-full"
                    >
                      <div className="w-full h-24 mb-3 flex items-center justify-center p-2 bg-slate-50 dark:bg-slate-800 rounded-lg overflow-hidden">
                        <img src={child.image} alt={child.label} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-110 transition-transform" />
                      </div>
                      <h3 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 text-center leading-tight mb-1 group-hover:underline">
                        {child.label}
                      </h3>
                      <span className="text-[10px] text-slate-400 font-medium bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        ({childCount})
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
                    isFavorite={favorites.has(product.id.toString())}
                    className="min-w-[280px] sm:min-w-0 flex-shrink-0 snap-center"
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
                    isFavorite={favorites.has(product.id.toString())}
                    className="min-w-[280px] sm:min-w-0 flex-shrink-0 snap-center"
                  />
                ) : null)}
              </div>
            </>
          ) : (
            /* --- GENERIC GRID FOR SEARCH & LISTINGS --- */
            <div className="flex flex-col lg:flex-row gap-8 items-start">

              {/* --- SIDEBAR FILTERS --- */}
              <aside className="w-full lg:w-64 shrink-0 space-y-8 hidden lg:block sticky top-24">
                {/* Categories Widget */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Menu size={18} /> Kategoriler
                  </h3>
                  <div className="space-y-1 max-h-60 overflow-y-auto scrollbar-thin">
                    {/* Show siblings or children based on context */}
                    {(() => {
                      // Logic: If in subcategory, show siblings. If in main category, show children.
                      let catsToShow = [];
                      let activeParent = ELECTRONICS_SUBCATEGORIES.find(c => c.id === activeTab);

                      // If activeTab is 'elektronik' or similar
                      if (!activeParent && activeTab !== 'anasayfa') {
                        // Try to find if activeTab IS a category
                        activeParent = ELECTRONICS_SUBCATEGORIES.find(c => c.id === activeTab) || HOME_OFFICE_SUBCATEGORIES.find(c => c.id === activeTab);
                      }

                      if (activeSubcategory) {
                        // Find parent of this sub
                        const parent = ELECTRONICS_SUBCATEGORIES.find(p => p.subIds?.includes(activeSubcategory)) ||
                          ELECTRONICS_SUBCATEGORIES.find(p => p.children?.some(c => c.id === activeSubcategory));
                        if (parent) {
                          if (parent.children) catsToShow = parent.children;
                          else if (parent.subIds) catsToShow = parent.subIds.map(id => ({ id, label: id })); // Fallback
                        }
                      } else if (activeParent && activeParent.children) {
                        catsToShow = activeParent.children;
                      } else {
                        // Fallback: Show main categories logic? 
                        // For now, just show popular subs if empty
                        catsToShow = ELECTRONICS_SUBCATEGORIES;
                      }

                      return catsToShow.map(c => {
                        const isActive = activeSubcategory === c.id;
                        return (
                          <button
                            key={c.id}
                            onClick={() => router.push(`/${c.id}`)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-colors ${isActive ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                          >
                            <span>{c.label || c.id}</span>
                            {isActive && <Check size={14} />}
                          </button>
                        )
                      });
                    })()}
                  </div>
                </div>

                {/* Brand Filter */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Zap size={18} className="text-amber-500" /> Markalar
                  </h3>
                  <div className="space-y-1">
                    {(() => {
                      // Compute Brands Facet
                      const brandCounts = {};
                      // Use mergedProducts filtered by Category/Subcategory (but not brand itself yet)
                      const baseList = activeSubcategory
                        ? mergedProducts.filter(p => p.subcategory === activeSubcategory || (ELECTRONICS_SUBCATEGORIES.find(s => s.id === activeSubcategory)?.subIds?.includes(p.subcategory)))
                        : mergedProducts.filter(p => p.category === activeTab);

                      baseList.forEach(p => {
                        const brand = p.name ? p.name.split(' ')[0] : 'Diğer';
                        brandCounts[brand] = (brandCounts[brand] || 0) + 1;
                      });

                      return Object.entries(brandCounts)
                        .sort((a, b) => b[1] - a[1]) // Sort by count
                        .slice(0, 10) // Top 10
                        .map(([brand, count]) => {
                          const isSelected = brandParam && brand.toLowerCase() === brandParam.toLowerCase();
                          return (
                            <button
                              key={brand}
                              onClick={() => {
                                const newParams = new URLSearchParams(searchParams.toString());
                                if (isSelected) newParams.delete('brand');
                                else newParams.set('brand', brand);
                                router.push(`?${newParams.toString()}`);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-colors ${isSelected ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold ring-1 ring-indigo-200 dark:ring-indigo-800' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                            >
                              <span>{brand}</span>
                              <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-500">{count}</span>
                            </button>
                          )
                        });
                    })()}
                  </div>
                </div>
              </aside>

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

                {/* PRODUCT GRID (From Logic) */}
                <div className={`${(!!activeSubcategory || !!brandParam) ? 'flex flex-col gap-4' : 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6'}`}>
                  {currentPaginatedProducts.map((product) => product ? (
                    <ProductCard
                      key={product.id}
                      variant={(!!activeSubcategory || !!brandParam) ? 'detailed-list' : 'card'}
                      product={product}
                      isSelected={selectedProducts.some(p => p.id === product.id)}
                      onClick={() => handleProductClick(product)}
                      onToggleCompare={(p) => selectedProducts.some(x => x.id === p.id) ? removeFromComparison(p.id) : addToComparison(p)}
                      onToggleFavorite={handleToggleFavorite}
                      isFavorite={favorites.has(product.id.toString())}
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
            </div>
          )}
      </main >

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <ComparisonBar />
    </div >
  );
}