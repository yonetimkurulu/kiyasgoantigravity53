'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { History, ChevronRight, Trophy, Clock, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useComparison } from '@/app/context/ComparisonContext';

export default function ComparisonHistory({ onClose }) {
    const { user, supabase } = useAuth();
    const { addProduct } = useComparison();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHistory();
    }, [user]);

    const loadHistory = async () => {
        setLoading(true);
        try {
            let items = [];

            if (user && supabase) {
                // Supabase'den çek (giriş yapmış kullanıcı)
                const { data, error } = await supabase
                    .from('comparison_history')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(20);

                if (!error && data) {
                    items = data;
                }
            }

            // localStorage'dan da çek ve birleştir
            const localItems = JSON.parse(localStorage.getItem('comparison_history') || '[]');

            // Eğer Supabase'den veri geldiyse, localStorage ile karşılaştır
            // Supabase öncelikli, localStorage yedek
            if (items.length === 0 && localItems.length > 0) {
                items = localItems;
            }

            setHistory(items);
        } catch (error) {
            console.error('Error loading history:', error);
            // Fallback to localStorage
            const localItems = JSON.parse(localStorage.getItem('comparison_history') || '[]');
            setHistory(localItems);
        } finally {
            setLoading(false);
        }
    };

    const deleteItem = async (id, index) => {
        try {
            if (user && supabase && id) {
                await supabase.from('comparison_history').delete().eq('id', id);
            }

            // localStorage'dan da sil
            const localItems = JSON.parse(localStorage.getItem('comparison_history') || '[]');
            localItems.splice(index, 1);
            localStorage.setItem('comparison_history', JSON.stringify(localItems));

            // State güncelle
            setHistory(prev => prev.filter((_, i) => i !== index));
        } catch (error) {
            console.error('Error deleting history item:', error);
        }
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

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (history.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                    <History className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">Henüz kıyaslama yapmadın</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">İlk kıyaslamanı yap, burada görünsün!</p>
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
                    <History className="text-indigo-600" size={22} />
                    Geçmiş Kıyaslamalar
                </h3>
                <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                    {history.length} kıyaslama
                </span>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {history.map((item, index) => (
                    <div
                        key={item.id || index}
                        className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-4 hover:shadow-md transition-shadow group"
                    >
                        <div className="flex items-start gap-3">
                            {/* Product Images Stack */}
                            <div className="flex -space-x-3 shrink-0">
                                {(item.product_images || []).slice(0, 3).map((img, imgIndex) => (
                                    <div
                                        key={imgIndex}
                                        className="w-12 h-12 rounded-lg border-2 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-700 overflow-hidden"
                                        style={{ zIndex: 3 - imgIndex }}
                                    >
                                        {img ? (
                                            <img src={img} alt="" className="w-full h-full object-contain" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">?</div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                            {(item.product_names || []).join(' vs ')}
                                        </p>
                                        {item.winner_name && (
                                            <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
                                                <Trophy size={12} />
                                                Kazanan: {item.winner_name}
                                            </p>
                                        )}
                                    </div>

                                    <button
                                        onClick={(e) => { e.stopPropagation(); deleteItem(item.id, index); }}
                                        className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                        title="Sil"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <p className="text-xs text-slate-400 flex items-center gap-1 mt-2">
                                    <Clock size={12} />
                                    {formatDate(item.created_at)}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Kıyaslama kaydetme fonksiyonu (dışa aktarılıyor)
export async function saveComparisonToHistory(supabase, user, products, winner) {
    const historyItem = {
        product_ids: products.map(p => p.id),
        product_names: products.map(p => p.name),
        product_images: products.map(p => p.image),
        winner_name: winner || null,
        created_at: new Date().toISOString()
    };

    // localStorage'a her zaman kaydet (hızlı erişim)
    try {
        const existing = JSON.parse(localStorage.getItem('comparison_history') || '[]');
        existing.unshift(historyItem);
        localStorage.setItem('comparison_history', JSON.stringify(existing.slice(0, 20)));
    } catch (e) {
        console.error('localStorage save error:', e);
    }

    // Supabase'e kaydet (giriş yapmış kullanıcı)
    if (user && supabase) {
        try {
            await supabase.from('comparison_history').insert({
                ...historyItem,
                user_id: user.id
            });
        } catch (error) {
            console.error('Supabase save error:', error);
        }
    }
}
