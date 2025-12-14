import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogOut, Edit2, Check, X as XIcon, Sparkles, User as UserIcon, Shield } from 'lucide-react';
import Header from '@/app/components/Header';
import Toast from '@/app/components/Toast';
import { containsBadWord } from '@/app/utils/badwords';

export default function ProfilePage() {
    const { user, loading, signOut, supabase, refreshUser } = useAuth();
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [nickname, setNickname] = useState('');
    const [fullName, setFullName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [updating, setUpdating] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/giris-yap');
        } else if (user) {
            setFullName(user.full_name || user.user_metadata?.full_name || '');
            setNickname(user.nickname || '');
            setAvatarUrl(user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`);
        }
    }, [user, loading, router]);

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
                updates.nickname = nickname;
            }

            if (Object.keys(updates).length === 0) {
                setToast({ message: "Değişiklik yapılmadı.", type: "info" });
                setIsEditing(false);
                setUpdating(false);
                return;
            }

            const { data: updatedData, error: updateError } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', user.id)
                .select();

            let finalError = updateError;

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

            await refreshUser();
            setToast({ message: "Profil başarıyla güncellendi!", type: "success" });
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating profile:", error);
            setToast({ message: error.message || "Profil güncellenirken bir hata oluştu.", type: "error" });
        } finally {
            setUpdating(false);
        }
    };

    if (loading || !user) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center dark:bg-slate-950">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    const displayName = user.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Kullanıcı';

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <Header activeTab="" onChatOpen={() => window.dispatchEvent(new CustomEvent('openChat'))} />
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="max-w-2xl mx-auto pt-10 pb-12 px-4">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Profil Ayarlarım</h1>
                    <p className="text-slate-500 dark:text-slate-400">Üyelik bilgilerinizi buradan güncelleyebilirsiniz.</p>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl shadow-indigo-100/50 dark:shadow-none border border-slate-100 dark:border-slate-800 relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-10"></div>

                    <div className="relative z-10 flex flex-col items-center">
                        {/* Avatar */}
                        <div className="relative group/avatar mb-6">
                            <div className="w-32 h-32 rounded-full bg-white dark:bg-slate-800 p-1 shadow-2xl">
                                <div className="w-full h-full rounded-full overflow-hidden border-4 border-slate-50 dark:border-slate-700 relative">
                                    {isEditing ? (
                                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <img src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} alt="Profile" className="w-full h-full object-cover" />
                                    )}
                                </div>
                            </div>
                            {isEditing && (
                                <button
                                    onClick={randomizeAvatar}
                                    className="absolute bottom-2 right-2 p-2.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-transform hover:scale-110 shadow-lg border-2 border-white dark:border-slate-800"
                                    title="Rastgele Değiştir"
                                >
                                    <Sparkles size={18} />
                                </button>
                            )}
                        </div>

                        {/* Form */}
                        <div className="w-full max-w-sm space-y-5">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block pl-1">İsim Soyisim</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        disabled={!isEditing}
                                        value={isEditing ? fullName : displayName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className={`w-full text-lg font-semibold rounded-xl px-4 py-3 border outline-none transition-all ${isEditing
                                                ? 'bg-slate-50 dark:bg-slate-800 border-indigo-300 dark:border-indigo-700 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900'
                                                : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
                                            }`}
                                    />
                                    {!isEditing && <UserIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block pl-1">Kullanıcı Adı (Nick)</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        disabled={!isEditing}
                                        value={isEditing ? nickname : (user.nickname || '')}
                                        onChange={(e) => setNickname(e.target.value)}
                                        placeholder="@kullanici"
                                        className={`w-full text-lg font-mono font-medium rounded-xl px-4 py-3 border outline-none transition-all ${isEditing
                                                ? 'bg-slate-50 dark:bg-slate-800 border-indigo-300 dark:border-indigo-700 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900'
                                                : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                                            }`}
                                    />
                                    {!isEditing && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 text-lg font-mono">@</span>}
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
                                {isEditing ? (
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleUpdateProfile}
                                            disabled={updating}
                                            className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2"
                                        >
                                            {updating ? 'Kaydediliyor...' : <><Check size={20} /> Değişiklikleri Kaydet</>}
                                        </button>
                                        <button
                                            onClick={() => { setIsEditing(false); setFullName(user.full_name || ''); setNickname(user.nickname || ''); }}
                                            className="px-6 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold transition-colors"
                                        >
                                            <XIcon size={20} />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="w-full py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Edit2 size={18} /> Profili Düzenle
                                    </button>
                                )}

                                <button
                                    onClick={signOut}
                                    className="w-full py-3.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                                >
                                    <LogOut size={18} /> Çıkış Yap
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
