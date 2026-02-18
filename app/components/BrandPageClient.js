
'use client';

import React, { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
// import Link from 'next/link';
import { ChevronRight, Filter, TrendingUp, SlidersHorizontal, Check } from 'lucide-react';
import { generatePrices, ELECTRONICS_SUBCATEGORIES, HOME_OFFICE_SUBCATEGORIES } from '../data';
import ProductCard from './ProductCard';
import Header from './Header';
import AuthModal from './AuthModal';
import Toast from './Toast';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';

const BrandPageClient = ({ brand, products }) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeCategory = searchParams.get('category');

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [sortOption, setSortOption] = useState('popular'); // popular, priceAsc, priceDesc
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [toast, setToast] = useState(null);

    const { user } = useAuth();
    const { isFavorite, toggleFavorite } = useFavorites();

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
    'use client';
    };

    // --- 1. Filter Products by Brand & Category ---
        let filtered = products;

        // Filter by Category if selected
        if (activeCategory) {
            filtered = filtered.filter(p =>
                p.subcategory === activeCategory ||
                p.category === activeCategory
            );
        }

        // Sort
        if (sortOption === 'priceAsc') {
            filtered.sort((a, b) => a.price - b.price);
        } else if (sortOption === 'priceDesc') {
            filtered.sort((a, b) => b.price - a.price);
        }
        // 'popular' is default order or could be rating based

        return filtered;
    }, [products, activeCategory, sortOption]);

    // --- 2. Extract Categories for Sidebar ---
    // Find which categories available products belong to
    const availableCategories = useMemo(() => {
        const cats = new Set();
        products.forEach(p => {
            if (p.subcategory) cats.add(p.subcategory);
        });

        // Map slug to readable label using data.js definitions
        const mappedCats = [];
        const allDefinitions = [...ELECTRONICS_SUBCATEGORIES, ...HOME_OFFICE_SUBCATEGORIES];

        // Also search in children
        const flatDefinitions = [];
        allDefinitions.forEach(d => {
            flatDefinitions.push(d);
            if (d.children) flatDefinitions.push(...d.children);
        });

        cats.forEach(slug => {
            const def = flatDefinitions.find(d => d.id === slug);
            if (def) {
                mappedCats.push(def);
            } else {
                // Fallback for unknown slugs
                mappedCats.push({ id: slug, label: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ') });
            }
        });

        return mappedCats.sort((a, b) => a.label.localeCompare(b.label));
    }, [products]);


    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            <div className="w-full bg-white dark:bg-slate-900 shadow-sm sticky top-0 z-30 mb-4 rounded-b-2xl">
                <Header activeTab="markalar" />
            </div>
            {/* --- HEADER / BREADCRUMB --- */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="container mx-auto px-4 py-3 md:py-4">
                    <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-4">
                        <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Ana Sayfa</Link>
                        <ChevronRight className="w-4 h-4 mx-2" />
                        <Link href="/markalar" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Markalar</Link>
                        <ChevronRight className="w-4 h-4 mx-2" />
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{brand.name}</span>
                    </div>

                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        <div className="w-24 h-24 bg-white dark:bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-center shadow-sm">
                            <img
                                src={brand.logo}
                                alt={brand.name}
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                                {brand.name} Fiyatları ve Modelleri
                            </h1>
                            <p className="text-slate-600 dark:text-slate-400">
                                {products.length} ürün listeleniyor
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">

                {/* --- SIDEBAR --- */}
                <aside className={`lg:w-64 shrink-0 space-y-6 ${isFilterOpen ? 'block' : 'hidden lg:block'}`}>

                    {/* Categories Widget */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <SlidersHorizontal size={18} /> Kategoriler
                        </h3>
                        <div className="space-y-1">
                            <Link
                                href={`/marka/${brand.id}`}
                                className={`block w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-colors ${!activeCategory
                                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                            >
                                <span>Tüm Kategoriler</span>
                                {!activeCategory && <Check size={14} />}
                            </Link>

                            {availableCategories.map(cat => (
                                <Link
                                    key={cat.id}
                                    href={`/marka/${brand.id}?category=${cat.id}`}
                                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-colors ${activeCategory === cat.id
                                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                >
                                    <span>{cat.label}</span>
                                    {activeCategory === cat.id && <Check size={14} />}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Banner / Ad Space (Optional) */}
                    <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-6 text-white text-center hidden lg:block">
                        <p className="text-sm font-medium opacity-90 mb-2">{brand.name} Fırsatları</p>
                        <p className="text-xl font-bold mb-4">En Yeni Modeller KıyasGO'da!</p>
                        <Link href={`/marka/${brand.id}`} className="block bg-white text-indigo-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-50 transition-colors w-full text-center">
                            İncele
                        </Link>
                    </div>

                </aside>


                {/* --- MAIN CONTENT --- */}
                <main className="flex-1">

                    {/* Toolbar (Mobile Filter & Sorting) */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 sticky top-20 z-10 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-sm py-2 lg:static lg:bg-transparent lg:py-0">
                        <div className="flex items-center gap-2 lg:hidden w-full sm:w-auto">
                            <button
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-xl font-medium text-sm shadow-sm"
                            >
                                <Filter size={16} /> Kategoriler
                            </button>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                            <span className="text-sm text-slate-500 dark:text-slate-400 hidden sm:inline">Sırala:</span>
                            <select
                                value={sortOption}
                                onChange={(e) => setSortOption(e.target.value)}
                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 px-3 py-2.5 outline-none shadow-sm cursor-pointer"
                            >
                                <option value="popular">En Popüler</option>
                                <option value="priceAsc">En Düşük Fiyat</option>
                                <option value="priceDesc">En Yüksek Fiyat</option>
                            </select>
                        </div>
                    </div>


                    {/* Visual Banner for Category (Optional) */}
                    {activeCategory && (
                        <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl flex items-center gap-3">
                            <TrendingUp className="text-indigo-600 dark:text-indigo-400" />
                            <div>
                                <h2 className="font-bold text-indigo-900 dark:text-indigo-300">
                                    {availableCategories.find(c => c.id === activeCategory)?.label || activeCategory} Fırsatları
                                </h2>
                                <p className="text-sm text-indigo-700 dark:text-indigo-400/80">
                                    {brand.name} markalı en popüler modeller burada.
                                </p>
                            </div>
                        </div>
                    )}


                    {/* Metric Cards (Products Count) */}
                    {filteredProducts.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Filter className="text-slate-400" size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Ürün Bulunamadı</h3>
                            <p className="text-slate-500 dark:text-slate-400">Seçtiğiniz kriterlere uygun ürün bulunmamaktadır.</p>
                            <Link
                                href={`/marka/${brand.id}`}
                                className="block mt-4 text-indigo-600 font-medium hover:underline"
                            >
                                Tüm Kategorileri Göster
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredProducts.map(product => (
                                <Link
                                    key={product.id}
                                    href={`/${product.subcategory || 'elektronik'}/${product.slug || product.id}`}
                                    passHref
                                    onClick={e => {
                                        if (
                                            e.target.closest('button') ||
                                            e.target.closest('[role="button"]')
                                        ) {
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }
                                    }}
                                >
                                    <ProductCard
                                        product={product}
                                        onToggleFavorite={handleToggleFavorite}
                                        isFavorite={isFavorite(product.id)}
                                        onToggleCompare={() => {}}
                                        isSelected={false}
                                    />
                                </Link>
                            ))}
                        </div>
                    )}

                </main>
            </div>
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
};

export default BrandPageClient;
