
"use client";

import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { User, Heart, Bell, LogOut, Edit2, Check, X as XIcon } from 'lucide-react';
import Header from '@/app/components/Header';
import ProductCard from '@/app/components/ProductCard';
import { PRODUCTS_DATA } from '@/app/data';
import { useComparison } from '@/app/context/ComparisonContext';

export default function ProfilePage() {
    const { user, loading, signOut, supabase } = useAuth();
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [nickname, setNickname] = useState('');
    const [fullName, setFullName] = useState('');
    const [updating, setUpdating] = useState(false);

    // Favorites State
    const [favoriteProducts, setFavoriteProducts] = useState([]);
    const [favLoading, setFavLoading] = useState(true);
    const { addToComparison, selectedProducts, removeFromComparison } = useComparison();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/giris-yap');
        } else if (user) {
            setFullName(user.full_name || user.user_metadata?.full_name || '');
            setNickname(user.nickname || '');

            // Fetch Favorites
            const fetchFavorites = async () => {
                const { data } = await supabase.from('favorites').select('product_id');
                if (data) {
                    const favIds = new Set(data.map(f => f.product_id));
                    // Filter from static data for now (or fetch dynamic if needed)
                    // Flatten PRODUCTS_DATA categories if needed, or use a flat list if available
                    // Assuming PRODUCTS_DATA is structured as Category -> Subcategory -> Products ???
                    // Actually PRODUCTS_DATA in data.js is usually a list or map. Let's assume it's a flat list based on ClientKiyasGo usage
                    // ClientKiyasGo imports PRODUCTS_DATA.

                    // Note: PRODUCTS_DATA in app/data.js seems to be an array based on usage elsewhere
                    const products = PRODUCTS_DATA.filter(p => favIds.has(p.id.toString()));
                    setFavoriteProducts(products);
                }
                setFavLoading(false);
            };
            fetchFavorites();
        }
    }, [user, loading, router, supabase]);

    const handleUpdateProfile = async () => {
        setUpdating(true);
        try {
            const updates = {};
            if (fullName !== user.full_name) updates.full_name = fullName;

            // Nickname Uniqueness Check
            if (nickname !== user.nickname) {
                if (nickname.length < 3) throw new Error("Kullanıcı adı en az 3 karakter olmalı.");

                const { data: existing } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('nickname', nickname)
                    .neq('id', user.id) // Exclude self
                    .single();

                if (existing) throw new Error("Bu kullanıcı adı başkası tarafından alınmış.");

                updates.nickname = nickname;
            }

            if (Object.keys(updates).length === 0) {
                setIsEditing(false);
                setUpdating(false);
                return;
            }

            // 1. Update in Profiles Table
            const { error: profileError } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', user.id);

            if (profileError) throw profileError;

            // 2. Update Auth Metadata (Sync Full Name)
            if (updates.full_name) {
                await supabase.auth.updateUser({
                    data: { full_name: updates.full_name }
                });
            }

            setIsEditing(false);
            window.location.reload();
        } catch (error) {
            console.error("Error updating profile:", error);
            alert(error.message || "Profil güncellenirken bir hata oluştu.");
        } finally {
            setUpdating(false);
        }
    };

    const handleRemoveFavorite = async (product) => {
        // Optimistic
        setFavoriteProducts(prev => prev.filter(p => p.id !== product.id));
        await supabase.from('favorites').delete().eq('user_id', user.id).eq('product_id', product.id.toString());
    };

    if (loading || !user) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center dark:bg-slate-950">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    // Generate Display Name (Prefer direct user prop which is merged with profile)
    const displayName = user.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Kullanıcı';

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <Header activeTab="" onChatOpen={() => window.dispatchEvent(new CustomEvent('openChat'))} />

            <div className="max-w-4xl mx-auto pt-8 pb-12 px-4">
                {/* Header Section */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-slate-100 dark:border-slate-800 mb-8 flex flex-col md:flex-row items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-4xl font-bold text-white shadow-lg shadow-indigo-200 dark:shadow-none shrink-0">
                        {displayName[0].toUpperCase()}
                    </div>
                    <div className="flex-1 text-center md:text-left w-full">
                        {isEditing ? (
                            <div className="space-y-3 mb-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">İsim Soyisim</label>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full text-lg font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="Ad Soyad"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Kullanıcı Adı (Nick)</label>
                                    <input
                                        type="text"
                                        value={nickname}
                                        onChange={(e) => setNickname(e.target.value)}
                                        className="w-full text-lg font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="@kullaniciadi"
                                    />
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button
                                        onClick={handleUpdateProfile}
                                        disabled={updating}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition-colors flex items-center gap-2"
                                    >
                                        <Check size={16} /> Kaydet
                                    </button>
                                    <button
                                        onClick={() => { setIsEditing(false); setFullName(user.full_name || ''); setNickname(user.nickname || ''); }}
                                        className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg font-bold text-sm hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                                    >
                                        <XIcon size={16} /> İptal
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="group mb-2">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {user.full_name || 'İsimsiz Kullanıcı'}
                                    </h1>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full transition-all"
                                        title="Profili Düzenle"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                </div>
                                <p className="text-indigo-600 dark:text-indigo-400 font-medium text-sm">@{user.nickname || 'nick_yok'}</p>
                            </div>
                        )}
                        <p className="text-slate-500 dark:text-slate-400 font-medium">{user.email}</p>
                        <p className="text-xs text-slate-400 mt-2">Üyelik Tarihi: {new Date(user.created_at).toLocaleDateString('tr-TR')}</p>
                    </div>
                    <button
                        onClick={signOut}
                        className="flex items-center gap-2 px-5 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    >
                        <LogOut size={18} />
                        Çıkış Yap
                    </button>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Navigation Sidebar */}
                    <div className="md:col-span-1 space-y-4">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Hesabım</h3>
                            <nav className="space-y-1">
                                <button className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 font-bold rounded-xl transition-colors">
                                    <User size={20} />
                                    Genel Bakış
                                </button>
                                <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium rounded-xl transition-colors">
                                    <Heart size={20} />
                                    Favorilerim
                                </button>
                                <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium rounded-xl transition-colors">
                                    <Bell size={20} />
                                    Fiyat Alarmları
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Favorites Preview */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Heart className="text-rose-500" />
                                    Favorilerim
                                    <span className="text-sm font-normal text-slate-500">({favoriteProducts.length})</span>
                                </h2>
                            </div>

                            {favLoading ? (
                                <div className="text-center py-8 text-slate-400">Yükleniyor...</div>
                            ) : favoriteProducts.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {favoriteProducts.map(product => (
                                        <ProductCard
                                            key={product.id}
                                            product={product}
                                            variant="card"
                                            isSelected={selectedProducts.some(p => p.id === product.id)}
                                            onToggleCompare={(p) => selectedProducts.some(x => x.id === p.id) ? removeFromComparison(p.id) : addToComparison(p)}
                                            isFavorite={true}
                                            onToggleFavorite={handleRemoveFavorite}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-8 text-center text-slate-400">
                                    <p>Favorilerinize ürün ekleyerek fiyatları takip edebilirsiniz.</p>
                                    <a href="/" className="inline-block mt-4 text-indigo-600 dark:text-indigo-400 font-bold hover:underline">Alışverişe Başla</a>
                                </div>
                            )}
                        </div>

                        {/* Alerts Preview */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Bell className="text-orange-500" />
                                    Fiyat Alarmları
                                </h2>
                                <span className="text-sm text-slate-400">Aktif alarm yok</span>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-8 text-center text-slate-400">
                                <p>İstediğiniz fiyata düşünce size haber verelim.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
