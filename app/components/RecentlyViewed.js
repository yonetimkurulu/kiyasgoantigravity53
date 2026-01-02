'use client';

import { useState, useEffect } from 'react';
import { Eye, ChevronRight, Trash2, Clock, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

// LocalStorage key
const STORAGE_KEY = 'recently_viewed_products';
const MAX_ITEMS = 20;

// Ürün görüntüleme kaydetme fonksiyonu (dışa aktarılıyor)
export function saveProductView(product) {
    if (!product || !product.id) return;

    try {
        const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

        // Aynı ürün zaten varsa çıkar
        const filtered = existing.filter(p => p.id !== product.id);

        // Yeni ürünü en başa ekle
        const viewItem = {
            id: product.id,
            name: product.name,
            image: product.image,
            price: product.price,
            slug: product.slug,
            viewed_at: new Date().toISOString()
        };

        filtered.unshift(viewItem);

        // Maksimum sayı sınırla
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered.slice(0, MAX_ITEMS)));
    } catch (e) {
        console.error('Error saving product view:', e);
    }
}

// Görüntüleme geçmişini temizle
export function clearRecentlyViewed() {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
        console.error('Error clearing history:', e);
    }
}

export default function RecentlyViewed() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = () => {
        setLoading(true);
        try {
            const items = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            setProducts(items);
        } catch (e) {
            console.error('Error loading recently viewed:', e);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const removeItem = (productId) => {
        try {
            const filtered = products.filter(p => p.id !== productId);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
            setProducts(filtered);
        } catch (e) {
            console.error('Error removing item:', e);
        }
    };

    const clearAll = () => {
        clearRecentlyViewed();
        setProducts([]);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Az önce';
        if (diffMins < 60) return `${diffMins} dk önce`;
        if (diffHours < 24) return `${diffHours} saat önce`;
        if (diffDays < 7) return `${diffDays} gün önce`;
        return date.toLocaleDateString('tr-TR');
    };

    const formatPrice = (price) => {
        if (!price) return '';
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0 }).format(price);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                    <Eye className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">Henüz ürün görüntülemedin</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Baktığın ürünler burada görünecek</p>
                <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                    Ürünleri Keşfet <ChevronRight size={18} />
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Eye className="text-slate-600" size={22} />
                    Son Baktıklarım
                </h3>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                        {products.length} ürün
                    </span>
                    <button
                        onClick={clearAll}
                        className="text-xs text-red-500 hover:text-red-600 font-medium"
                    >
                        Tümünü Temizle
                    </button>
                </div>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {products.map((product) => (
                    <Link
                        key={product.id}
                        href={`/${product.slug}`}
                        className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-4 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800 transition-all group flex items-center gap-4"
                    >
                        {/* Product Image */}
                        <div className="w-16 h-16 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                            {product.image ? (
                                <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <ShoppingBag className="w-6 h-6 text-slate-400" />
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {product.name}
                            </p>
                            {product.price && (
                                <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                                    {formatPrice(product.price)}
                                </p>
                            )}
                            <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                                <Clock size={12} />
                                {formatDate(product.viewed_at)}
                            </p>
                        </div>

                        {/* Actions */}
                        <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeItem(product.id); }}
                            className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                            title="Kaldır"
                        >
                            <Trash2 size={16} />
                        </button>

                        <ChevronRight size={18} className="text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                ))}
            </div>
        </div>
    );
}
