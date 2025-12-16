"use client";

import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogOut, Edit2, Check, X as XIcon, Sparkles, User as UserIcon, Shield, Bell, Heart, Home, ChevronRight, AlertTriangle } from 'lucide-react';
import Header from '@/app/components/Header';
import Toast from '@/app/components/Toast';
import { containsBadWord } from '@/app/utils/badwords';

export default function ProfilePage() {
    const { user, loading, signOut, supabase, refreshUser } = useAuth();
    const router = useRouter();

    // View State
    const [view, setView] = useState('dashboard'); // 'dashboard' | 'personal'

    // Edit Form State
    const [nickname, setNickname] = useState('');
    const [fullName, setFullName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [updating, setUpdating] = useState(false);
    const [toast, setToast] = useState(null);

    // Password Form State
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Initialization & Data Recovery
    useEffect(() => {
        if (!loading && !user) {
            router.push('/giris-yap');
        } else if (user) {
            // If we have user but no profile data (nick/avatar), force a refresh
            // This handles the "F5 on profile page" issue where context might settle too early
            if (!user.nickname || !user.avatar_url) {
                console.log("ProfilePage: Missing profile data, forcing refresh...");
                refreshUser();
            }

            setFullName(user.full_name || user.user_metadata?.full_name || '');
            setNickname(user.nickname || '');
            setAvatarUrl(user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`);
        }
    }, [user, loading, router, refreshUser]);

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
            if (avatarUrl !== user.avatar_url) updates.avatar_url = avatarUrl;

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

                // Check Rate Limit (24 hours)
                const lastUpdate = user.user_metadata?.nickname_updated_at;
                if (lastUpdate) {
                    const lastDate = new Date(lastUpdate);
                    const now = new Date();
                    const diffHours = (now - lastDate) / (1000 * 60 * 60);
                    if (diffHours < 24) {
                        const hoursLeft = Math.ceil(24 - diffHours);
                        setToast({ message: `Kullanıcı adını günde 1 kez değiştirebilirsin. ${hoursLeft} saat kaldı.`, type: "error" });
                        setUpdating(false);
                        return;
                    }
                }

                updates.nickname = nickname;
            }

            if (Object.keys(updates).length === 0) {
                setToast({ message: "Değişiklik yapılmadı.", type: "info" });
                setUpdating(false);
                return;
            }

            // 1. Try UPDATE
            const { data: updatedData, error: updateError } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', user.id)
                .select();

            let finalError = updateError;

            // 2. Try INSERT (fallback)
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

            // UPDATE AUTH METADATA (Full Name + Nickname + Avatar)
            const metaUpdates = {};
            if (updates.full_name) metaUpdates.full_name = updates.full_name;
            if (updates.avatar_url) metaUpdates.avatar_url = updates.avatar_url;
            if (updates.nickname) {
                metaUpdates.nickname = updates.nickname;
                metaUpdates.nickname_updated_at = new Date().toISOString();
            }

            if (Object.keys(metaUpdates).length > 0) {
                const { error: authError } = await supabase.auth.updateUser({
                    data: metaUpdates
                });
                if (authError) console.error("Auth update error:", authError);
            }

            await refreshUser();
            setToast({ message: "Profil başarıyla güncellendi!", type: "success" });
            setView('dashboard'); // Return to dashboard on success
        } catch (error) {
            console.error("Error updating profile:", error);
            setToast({ message: error.message || "Profil güncellenirken bir hata oluştu.", type: "error" });
        } finally {
            setUpdating(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (password !== confirmPassword) {
            setToast({ message: "Şifreler eşleşmiyor.", type: "error" });
            return;
        }
        if (password.length < 6) {
            setToast({ message: "Şifre en az 6 karakter olmalı.", type: "error" });
            return;
        }

        setUpdating(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: password });
            if (error) throw error;

            setToast({ message: "Şifreniz başarıyla güncellendi.", type: "success" });
            setPassword('');
            setConfirmPassword('');
            setView('dashboard');
        } catch (err) {
            setToast({ message: err.message || "Şifre güncellenemedi.", type: "error" });
        } finally {
            setUpdating(false);
        }
    };

    // MENU CONFIG
    const MENU_ITEMS = [
        { id: 'personal', icon: UserIcon, label: 'Kişisel Bilgilerim', desc: 'İsim, nick ve avatar düzenle', color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20', action: () => setView('personal') },
        { id: 'password', icon: Shield, label: 'Şifre Değişikliği', desc: 'Güvenlik ayarlarınızı yönetin', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', action: () => setView('password') },
        { id: 'notifications', icon: Bell, label: 'Bildirim Tercihlerim', desc: 'Haber ve kampanya bildirimleri', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', action: () => setToast({ message: "Bu özellik yakında aktif.", type: "info" }) },
        { id: 'favorites', icon: Heart, label: 'Favorilerim', desc: 'Takip ettiğiniz ürünler', color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20', link: '/favoriler' },
        { id: 'alarms', icon: Bell, label: 'Alarmlarım', desc: 'Fiyat takibi ve bildirimler', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20', action: () => setToast({ message: "Henüz alarmınız yok.", type: "info" }) },
        { id: 'history', icon: Check, label: 'Son Baktıklarım', desc: 'Geçmiş ürün gezintileriniz', color: 'text-slate-600', bg: 'bg-slate-100 dark:bg-slate-800', action: () => setToast({ message: "Son bakılanlar kaydediliyor.", type: "success" }) },
    ];

    if (loading || !user) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center dark:bg-slate-950">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    const displayName = user.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Kullanıcı';

    // RENDER: EDIT PROFILE VIEW
    if (view === 'personal') {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
                <Header activeTab="" onChatOpen={() => window.dispatchEvent(new CustomEvent('openChat'))} />
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

                <div className="max-w-2xl mx-auto pt-10 pb-12 px-4">
                    <button onClick={() => setView('dashboard')} className="mb-6 flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium">
                        <ChevronRight className="rotate-180" size={20} /> Hesabım Menüsüne Dön
                    </button>

                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl shadow-indigo-100/50 dark:shadow-none border border-slate-100 dark:border-slate-800 relative overflow-hidden">

                        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600">
                                <UserIcon size={24} />
                            </div>
                            Kişisel Bilgilerim
                        </h2>

                        <div className="flex flex-col items-center">
                            {/* Avatar */}
                            <div className="relative group/avatar mb-8">
                                <div className="w-32 h-32 rounded-full bg-white dark:bg-slate-800 p-1 shadow-2xl">
                                    <div className="w-full h-full rounded-full overflow-hidden border-4 border-slate-50 dark:border-slate-700 relative">
                                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    </div>
                                </div>
                                <button
                                    onClick={randomizeAvatar}
                                    className="absolute bottom-2 right-2 p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-transform hover:scale-110 shadow-lg border-2 border-white dark:border-slate-800"
                                    title="Rastgele Değiştir"
                                >
                                    <Sparkles size={20} />
                                </button>
                            </div>

                            {/* Form */}
                            <div className="w-full max-w-sm space-y-5">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block pl-1">İsim Soyisim</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={fullName}
                                            readOnly
                                            disabled
                                            className="w-full text-lg font-semibold rounded-xl px-4 py-3 border outline-none bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-500 cursor-not-allowed"
                                        />
                                        <Shield className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block pl-1">Kullanıcı Adı</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={nickname}
                                            onChange={(e) => setNickname(e.target.value)}
                                            placeholder="@kullanici"
                                            className="w-full text-lg font-mono font-medium rounded-xl px-4 py-3 border outline-none transition-all bg-slate-50 dark:bg-slate-800 border-indigo-300 dark:border-indigo-700 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900 text-slate-600 dark:text-slate-300"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 text-lg font-mono">@</span>
                                    </div>
                                </div>

                                {/* Email (Read Only) */}
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block pl-1">E-Posta Adresi</label>
                                    <div className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-transparent text-slate-500 dark:text-slate-400 flex items-center justify-between">
                                        <span>{user.email}</span>
                                        <Shield size={16} className="text-green-500" />
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="pt-6 flex flex-col gap-3">
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleUpdateProfile}
                                            disabled={updating}
                                            className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2"
                                        >
                                            {updating ? 'Kaydediliyor...' : <><Check size={20} /> Kaydet</>}
                                        </button>
                                        <button
                                            onClick={() => { setView('dashboard'); setFullName(user.full_name || ''); setNickname(user.nickname || ''); }}
                                            className="px-6 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold transition-colors"
                                        >
                                            <XIcon size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // RENDER: PASSWORD VIEW
    if (view === 'password') {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
                <Header activeTab="" onChatOpen={() => window.dispatchEvent(new CustomEvent('openChat'))} />
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

                <div className="max-w-2xl mx-auto pt-10 pb-12 px-4">
                    <button onClick={() => setView('dashboard')} className="mb-6 flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium">
                        <ChevronRight className="rotate-180" size={20} /> Hesabım Menüsüne Dön
                    </button>

                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl shadow-cyan-100/50 dark:shadow-none border border-slate-100 dark:border-slate-800 relative overflow-hidden">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600">
                                <Shield size={24} />
                            </div>
                            Şifre Değişikliği
                        </h2>

                        <div className="w-full max-w-sm mx-auto space-y-5">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block pl-1">Yeni Şifre</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full text-lg rounded-xl px-4 py-3 border outline-none transition-all bg-slate-50 dark:bg-slate-800 border-indigo-300 dark:border-indigo-700 focus:ring-4 focus:ring-emerald-100 dark:focus:ring-emerald-900 text-slate-900 dark:text-white"
                                    placeholder="En az 6 karakter"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block pl-1">Yeni Şifre (Tekrar)</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full text-lg rounded-xl px-4 py-3 border outline-none transition-all bg-slate-50 dark:bg-slate-800 border-indigo-300 dark:border-indigo-700 focus:ring-4 focus:ring-emerald-100 dark:focus:ring-emerald-900 text-slate-900 dark:text-white"
                                    placeholder="Şifreyi tekrar girin"
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    onClick={handleUpdatePassword}
                                    disabled={updating}
                                    className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-200 dark:shadow-none flex items-center justify-center gap-2"
                                >
                                    {updating ? 'Güncelleniyor...' : <><Check size={20} /> Şifreyi Güncelle</>}
                                </button>
                                <button
                                    onClick={() => { setView('dashboard'); setPassword(''); setConfirmPassword(''); }}
                                    className="px-6 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold transition-colors"
                                >
                                    <XIcon size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // RENDER: DASHBOARD VIEW (DEFAULT)
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <Header activeTab="" onChatOpen={() => window.dispatchEvent(new CustomEvent('openChat'))} />
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="max-w-5xl mx-auto pt-10 pb-12 px-4">

                {/* 1. Top Section: User Summary */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 mb-8 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <div className="w-full h-24 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 absolute top-0 left-0"></div>

                    <div className="relative z-10 -mt-6">
                        <div className="w-24 h-24 mx-auto rounded-full bg-white dark:bg-slate-800 p-1 shadow-xl mb-4">
                            <img src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} alt="Profile" className="w-full h-full object-cover rounded-full" />
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-1">{displayName}</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">{user.email}</p>
                        {user.nickname && <p className="text-indigo-600 dark:text-indigo-400 text-xs font-bold mt-1">@{user.nickname}</p>}
                    </div>


                    {/* Optional: Email Confirmation Notice (Mimicking screenshot) */}
                    {!user.email_confirmed_at && (
                        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-4 py-3 rounded-xl text-sm max-w-2xl mx-auto flex items-start gap-2 text-left">
                            <Shield size={20} className="shrink-0 mt-0.5" />
                            <div>
                                <span className="font-bold block mb-1">E-Posta adresinizi onaylayın</span>
                                <div>E-Posta adresinize gönderdiğimiz linke tıklayarak e-postanızı doğrulamanız gerekmektedir.</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 2. Grid Menu */}
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 px-2">Hesabım Menüsü</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {MENU_ITEMS.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => {
                                if (item.link) router.push(item.link);
                                else if (item.action) item.action();
                            }}
                            className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800 transition-all cursor-pointer group flex items-start gap-4"
                        >
                            <div className={`p-3 rounded-xl ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}>
                                <item.icon size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-slate-900 dark:text-white text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center gap-2">
                                    {item.label}
                                    {item.id === 'personal' && !user.nickname && (
                                        <div className="relative group/tooltip">
                                            <AlertTriangle size={20} className="text-amber-500 animate-pulse" />
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none">
                                                Kullanıcı adı belirle
                                            </div>
                                        </div>
                                    )}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-tight mt-1">
                                    {item.desc}
                                </p>
                            </div>
                            <div className="self-center opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                                <ChevronRight size={20} className="text-slate-300 dark:text-slate-600" />
                            </div>
                        </div>
                    ))}

                    {/* Bize Ulaşın / Sign Out Row */}
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 border-t border-slate-100 dark:border-slate-800 pt-8">
                        <a href="mailto:destek@kiyasgo.com" className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600"><Home size={20} /></div>
                            <span className="font-bold text-slate-700 dark:text-slate-200">Bize Ulaşın</span>
                        </a>

                        <button onClick={signOut} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-3 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors group">
                            <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-500 group-hover:text-red-600"><LogOut size={20} /></div>
                            <span className="font-bold text-red-500 group-hover:text-red-600">Çıkış Yap</span>
                        </button>
                    </div>

                </div>

                {/* Footer Info */}
                <div className="mt-12 text-center pb-8 opacity-50">
                    <img src="/favicon.ico" alt="Logo" className="w-8 h-8 mx-auto -mb-1 opacity-50 grayscale" />
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest mt-2">KıyasGO Hesabım v1.2</p>
                </div>

            </div>
        </div>
    );
}

