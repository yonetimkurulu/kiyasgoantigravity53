
"use client";

import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { User, Heart, Bell, LogOut, Edit2, Check, X as XIcon, Sparkles } from 'lucide-react';
import Header from '@/app/components/Header';
import ProductCard from '@/app/components/ProductCard';
import Toast from '@/app/components/Toast';
import { containsBadWord } from '@/app/utils/badwords';
import { PRODUCTS_DATA } from '@/app/data';
import { useComparison } from '@/app/context/ComparisonContext';


export default function ProfilePage() {
    const { user, loading, signOut, supabase, refreshUser } = useAuth();
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [nickname, setNickname] = useState('');
    const [fullName, setFullName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [updating, setUpdating] = useState(false);

    // Favorites State
    const [favoriteProducts, setFavoriteProducts] = useState([]);
    const [favLoading, setFavLoading] = useState(true);
    const { addToComparison, selectedProducts, removeFromComparison } = useComparison();
    const [toast, setToast] = useState(null); // { message, type }

    useEffect(() => {
        if (!loading && !user) {
            router.push('/giris-yap');
        } else if (user) {
            setFullName(user.full_name || user.user_metadata?.full_name || '');
            setNickname(user.nickname || '');
            setAvatarUrl(user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`); // Default based on ID

            // Fetch Favorites & Products
            const fetchFavorites = async () => {
                const { data: favData } = await supabase.from('favorites').select('product_id');

                if (favData && favData.length > 0) {
                    const favIds = new Set(favData.map(f => f.product_id));
                    let loadedProducts = [];

                    // 1. Try finding in static data
                    const safeProductsData = Array.isArray(PRODUCTS_DATA) ? PRODUCTS_DATA : [];
                    const staticMatches = safeProductsData.filter(p => favIds.has(p.id.toString()));
                    loadedProducts = [...staticMatches];

                    // 2. Fetch from 'products' table for Live Data (if not found in static)
                    // We need to fetch potential matches. Since we don't know if ID is slug or name, 
                    // we might need to fetch all or use an 'in' query if we assume ID = slug.
                    // ClientKiyasGo logic: id = live.slug || live.name normalized.
                    // Best bet: Fetch products where slug is in favIds

                    const neededIds = [...favIds].filter(id => !staticMatches.find(p => p.id === id));

                    if (neededIds.length > 0) {
                        const { data: liveData } = await supabase
                            .from('products')
                            .select('*')
                            .in('slug', neededIds);

                        if (liveData) {
                            const formattedLive = liveData.map(live => ({
                                ...live,
                                id: live.slug || live.id, // Fallback
                                image: live.image || live.image1 || "https://example.com/placeholder.jpg",
                                desc: live.desc || 'Ürün açıklaması yakında eklenecek.',
                                rating: live.rating || 4.5,
                                category: live.category || 'elektronik',
                                subcategory: (live.subcategory || 'cep-telefonu').toLowerCase().trim().replace(/ /g, '-'),
                                prices: live.stores || [],
                                price: live.price || 0,
                                specs: live.specs || [], // Ensure array for slice()
                            }));
                            loadedProducts = [...loadedProducts, ...formattedLive];
                        }
                    }

                    setFavoriteProducts(loadedProducts);
                } else {
                    setFavoriteProducts([]);
                }
                setFavLoading(false);
            };
            fetchFavorites();
        }
    }, [user, loading, router, supabase]);

    const randomizeAvatar = () => {
        const randomSeed = Math.random().toString(36).substring(7);
        setAvatarUrl(`https://api.dicebear.com/7.x/avataaars/svg?seed=${randomSeed}`);
    };

    const handleUpdateProfile = async () => {
        setUpdating(true);
        try {
            const updates = {};
            const currentFullName = user.full_name || user.user_metadata?.full_name || '';
            if (fullName !== currentFullName) updates.full_name = fullName;
            if (avatarUrl !== user.avatar_url) updates.avatar_url = avatarUrl; // Track avatar change

            if (nickname !== (user.nickname || '')) {
                if (nickname.length < 3) {
                    setToast({ message: "Kullanıcı adı en az 3 karakter olmalı.", type: "error" });
                    setUpdating(false);
                    return;
                }
                if (containsBadWord(nickname)) {
                    setToast({ message: "Kullanıcı adı uygunsuz ifadeler içeremez.", type: "error" });
                    setUpdating(false);
                    return;
                }
                updates.nickname = nickname;
            }

            if (Object.keys(updates).length === 0) {
                setToast({ message: "Değişiklik yapılmadı.", type: "info" });
                setIsEditing(false);
                setUpdating(false);
                return;
            }

            // 1. Try UPDATE first
            const { data: updatedData, error: updateError } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', user.id)
                .select();

            let finalError = updateError;

            // If Update failed because row missing, try INSERT
            if (!updateError && (!updatedData || updatedData.length === 0)) {
                const { error: insertError } = await supabase
                    .from('profiles')
                    .insert({
                        id: user.id,
                        ...updates,
                        updated_at: new Date().toISOString()
                    });
                finalError = insertError;
            }

            if (finalError) {
                if (finalError.code === '23505') {
                    throw new Error("Bu kullanıcı adı başkası tarafından alınmış.");
                }
                throw finalError;
            }

            if (updates.full_name) {
                const { error: authError } = await supabase.auth.updateUser({
                    data: { full_name: updates.full_name }
                });
                if (authError) console.error("Auth update error:", authError);
            }

            try {
                await refreshUser();
            } catch (err) {
                console.error("Refresh failed:", err);
            }

            setToast({ message: "Profil başarıyla güncellendi!", type: "success" });
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating profile:", error);
            setToast({ message: error.message || "Profil güncellenirken bir hata oluştu.", type: "error" });
        } finally {
            setUpdating(false);
        }
    };

    const handleRemoveFavorite = async (product) => {
        // Optimistic
        setFavoriteProducts(prev => prev.filter(p => p.id !== product.id));
        setToast({ message: "Ürün favorilerden kaldırıldı.", type: 'remove' });
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
                    <div className="relative group/avatar">
                        <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden shadow-lg border-4 border-white dark:border-slate-700">
                            {isEditing ? (
                                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                user.avatar_url ? (
                                    <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-4xl font-bold text-white">
                                        {displayName[0].toUpperCase()}
                                    </div>
                                )
                            )}
                        </div>
                        {isEditing && (
                            <button
                                onClick={randomizeAvatar}
                                className="absolute bottom-0 right-0 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors shadow-md"
                                title="Avatarı Değiştir"
                            >
                                <Sparkles size={16} />
                            </button>
                        )}
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
                                <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 font-bold rounded-xl transition-colors">
                                    <User size={20} />
                                    Genel Bakış
                                </button>
                                <button onClick={() => document.getElementById('favorites-section')?.scrollIntoView({ behavior: 'smooth' })} className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium rounded-xl transition-colors">
                                    <Heart size={20} />
                                    Favorilerim
                                </button>
                                <button onClick={() => document.getElementById('alerts-section')?.scrollIntoView({ behavior: 'smooth' })} className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium rounded-xl transition-colors">
                                    <Bell size={20} />
                                    Fiyat Alarmları
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Favorites Preview */}
                        <div id="favorites-section" className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
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
                        <div id="alerts-section" className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
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
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}
