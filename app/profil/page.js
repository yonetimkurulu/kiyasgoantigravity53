
"use client";

import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { User, Heart, Bell, LogOut } from 'lucide-react';

export default function ProfilePage() {
    const { user, loading, signOut } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/giris-yap');
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center dark:bg-slate-950">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-28 pb-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-slate-100 dark:border-slate-800 mb-8 flex flex-col md:flex-row items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-4xl font-bold text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                        {user.email?.[0].toUpperCase()}
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                            {user.full_name || 'Kullanıcı'}
                        </h1>
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
                                </h2>
                                <span className="text-sm text-slate-400">Henüz favori ürün yok</span>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-8 text-center text-slate-400">
                                <p>Favorilerinize ürün ekleyerek fiyatları takip edebilirsiniz.</p>
                                <a href="/" className="inline-block mt-4 text-indigo-600 dark:text-indigo-400 font-bold hover:underline">Alışverişe Başla</a>
                            </div>
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
