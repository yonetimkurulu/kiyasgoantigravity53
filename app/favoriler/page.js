"use client";

import { useAuth } from '@/app/context/AuthContext';
import { useFavorites } from '@/app/context/FavoritesContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Heart, Home, ChevronRight, RefreshCw } from 'lucide-react';
import Header from '@/app/components/Header';
import ProductCard from '@/app/components/ProductCard';
import Toast from '@/app/components/Toast';
import { PRODUCTS_DATA } from '@/app/data';
import { useComparison } from '@/app/context/ComparisonContext';
import Link from 'next/link';

// Turkish-compatible Slugify
const slugify = (text) => {
    if (!text) return '';
    try {
        text = decodeURIComponent(text);
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

export default function FavoritesPage() {
    const { user, loading: authLoading, supabase } = useAuth();
    const { getFavoriteIds, toggleFavorite, isLoading: favContextLoading, refreshFavorites } = useFavorites();
    const router = useRouter();

    const [favoriteProducts, setFavoriteProducts] = useState([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(true);
    const { addToComparison, selectedProducts, removeFromComparison } = useComparison();
    const [toast, setToast] = useState(null);

    // Redirect if not logged in
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/giris-yap');
        }
    }, [user, authLoading, router]);

    // Fetch product details for favorite IDs
    useEffect(() => {
        const loadFavoriteProducts = async () => {
            if (authLoading || favContextLoading || !user) return;

            const favoriteIds = getFavoriteIds();

            if (favoriteIds.length === 0) {
                setFavoriteProducts([]);
                setIsLoadingProducts(false);
                return;
            }

            try {
                let loadedProducts = [];

                // 1. Try finding in static data
                const safeProductsData = Array.isArray(PRODUCTS_DATA) ? PRODUCTS_DATA : [];
                const staticMatches = safeProductsData.filter(p => favoriteIds.includes(p.id?.toString()));
                loadedProducts = [...staticMatches];

                // 2. Fetch from 'products' table for Live Data
                const neededIds = favoriteIds.filter(id => !staticMatches.find(p => p.id?.toString() === id));

                if (neededIds.length > 0 && supabase) {
                    const { data: liveData } = await supabase
                        .from('products')
                        .select('*')
                        .in('slug', neededIds);

                    if (liveData) {
                        const formattedLive = liveData.map(live => ({
                            ...live,
                            id: live.slug || live.id,
                            image: live.image || live.image1 || "https://example.com/placeholder.jpg",
                            desc: live.desc || 'Ürün açıklaması yakında eklenecek.',
                            rating: live.rating || 4.5,
                            category: live.category || 'elektronik',
                            subcategory: (live.subcategory || 'cep-telefonu').toLowerCase().trim().replace(/ /g, '-'),
                            prices: live.stores || [],
                            price: live.price || 0,
                            specs: live.specs || [],
                        }));
                        loadedProducts = [...loadedProducts, ...formattedLive];
                    }
                }

                setFavoriteProducts(loadedProducts);
            } catch (err) {
                console.error('Error loading favorite products:', err);
            } finally {
                setIsLoadingProducts(false);
            }
        };

        loadFavoriteProducts();
    }, [user, authLoading, favContextLoading, getFavoriteIds, supabase]);

    const handleRemoveFavorite = async (product) => {
        // Optimistic UI update
        const previousProducts = [...favoriteProducts];
        setFavoriteProducts(prev => prev.filter(p => p.id !== product.id));
        setToast({ message: "Ürün favorilerden kaldırıldı.", type: 'remove' });

        const result = await toggleFavorite(product.id);

        if (!result.success) {
            // Rollback on error
            setFavoriteProducts(previousProducts);
            setToast({ message: "Hata oluştu, tekrar deneyin.", type: 'error' });
        }
    };

    const handleProductClick = (product) => {
        const rawSlug = product.slug || product.name;
        const cleanSlug = slugify(rawSlug);
        const sub = product.subcategory ? slugify(product.subcategory) : 'genel';
        router.push(`/${sub}/en-ucuz-${cleanSlug}-fiyati`);
    };

    const handleRefresh = async () => {
        setIsLoadingProducts(true);
        await refreshFavorites();
    };

    if (authLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <Header activeTab="" onChatOpen={() => window.dispatchEvent(new CustomEvent('openChat'))} />
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Breadcrumb */}
                <div className="flex items-center text-sm text-slate-500 mb-6">
                    <Link href="/" className="hover:text-indigo-600 flex items-center gap-1"><Home size={14} /> Anasayfa</Link>
                    <ChevronRight size={14} className="mx-2" />
                    <span className="font-bold text-slate-800 dark:text-white">Favorilerim</span>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 min-h-[400px]">
                    <div className="flex items-center justify-between mb-8 border-b border-slate-100 dark:border-slate-800 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-rose-100 dark:bg-rose-900/30 p-2 rounded-lg text-rose-500">
                                <Heart size={24} fill="currentColor" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 dark:text-white">Favorilerim</h1>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Takip ettiğiniz ürünler burada listelenir.</p>
                            </div>
                        </div>
                        <button
                            onClick={handleRefresh}
                            disabled={isLoadingProducts}
                            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                            title="Yenile"
                        >
                            <RefreshCw size={18} className={`text-slate-600 dark:text-slate-400 ${isLoadingProducts ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    {isLoadingProducts || favContextLoading ? (
                        <div className="text-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                            <p className="text-slate-400">Favoriler yükleniyor...</p>
                        </div>
                    ) : favoriteProducts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {favoriteProducts.map(product => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    variant="card"
                                    isSelected={selectedProducts.some(p => p.id === product.id)}
                                    onClick={() => handleProductClick(product)}
                                    onToggleCompare={(p) => selectedProducts.some(x => x.id === p.id) ? removeFromComparison(p.id) : addToComparison(p)}
                                    isFavorite={true}
                                    onToggleFavorite={handleRemoveFavorite}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 flex flex-col items-center">
                            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-full mb-4">
                                <Heart size={48} className="text-slate-300 dark:text-slate-600" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Listeniz Henüz Boş</h3>
                            <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
                                Beğendiğiniz ürünleri favorilere ekleyerek fiyatlarını buradan takip edebilirsiniz.
                            </p>
                            <Link href="/" className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors">
                                Alışverişe Başla
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
