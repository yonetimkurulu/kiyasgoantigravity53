"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Loader2, User, Check, ArrowRight } from 'lucide-react';
import { containsBadWord } from '@/app/utils/badwords';

export default function SetUsernamePage() {
    const { user, loading, supabase, refreshUser } = useAuth();
    const router = useRouter();
    const [nickname, setNickname] = useState('');
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/giris-yap');
        } else if (user && user.nickname) {
            // Already has nickname
            router.push('/');
        }
    }, [user, loading, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setUpdating(true);

        // Validation
        if (nickname.length < 3) {
            setError("Kullanıcı adı en az 3 karakter olmalı.");
            setUpdating(false);
            return;
        }
        if (!/^[a-zA-Z0-9_]+$/.test(nickname)) {
            setError("Sadece harf, rakam ve alt çizgi (_) kullanabilirsiniz.");
            setUpdating(false);
            return;
        }
        if (containsBadWord(nickname)) {
            setError("Kullanıcı adı uygunsuz ifadeler içeremez.");
            setUpdating(false);
            return;
        }

        try {
            // Check uniqueness
            const { data: existing } = await supabase
                .from('profiles')
                .select('id')
                .eq('nickname', nickname)
                .neq('id', user.id) // Exclude self if update
                .single();

            if (existing) {
                setError("Bu kullanıcı adı başkası tarafından alınmış.");
                setUpdating(false);
                return;
            }

            // Update Profile
            const { error: updateError } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    nickname: nickname,
                    updated_at: new Date().toISOString()
                });

            if (updateError) throw updateError;

            // Sync Metadata
            await supabase.auth.updateUser({
                data: { nickname_updated_at: new Date().toISOString() }
            });

            await refreshUser();
            router.push('/');

        } catch (err) {
            console.error("Username update error:", err);
            setError(err.message || "Bir hata oluştu.");
        } finally {
            setUpdating(false);
        }
    };

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-black">
                <Loader2 className="animate-spin text-indigo-600" size={32} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 p-8">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto mb-4">
                        <User size={32} />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Hoş Geldin! 👋</h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Topluluğumuza katılmadan önce kendine havalı bir kullanıcı adı belirle.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 rounded-xl text-sm font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                            Kullanıcı Adı Belirle
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value.toLowerCase().replace(/\s/g, ''))}
                                placeholder="kullanici_adi"
                                className="w-full text-lg font-bold px-5 py-4 pl-12 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white"
                                autoFocus
                            />
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">@</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-2 ml-1">
                            Örn: <span className="text-slate-600 dark:text-slate-300 font-medium">ali_yilmaz</span> veya <span className="text-slate-600 dark:text-slate-300 font-medium">gamer_tr</span>
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={updating || !nickname}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center justify-center gap-2"
                    >
                        {updating ? <Loader2 className="animate-spin" /> : <><Check size={20} /> Tamamla ve Devam Et</>}
                    </button>
                </form>
            </div>
        </div>
    );
}
