"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Shield, Check, AlertCircle } from 'lucide-react';

export default function ResetPasswordPage() {
    const { supabase, loading } = useAuth();
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    // Simple check to ensure we have a session (link clicked)
    useEffect(() => {
        if (!loading) {
            supabase.auth.getSession().then(({ data: { session } }) => {
                if (!session) {
                    setError("Geçersiz veya süresi dolmuş bağlantı. Lütfen tekrar şifre sıfırlama isteği gönderin.");
                }
            });
        }
    }, [loading, supabase.auth]);

    const handleUpdatePassword = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError("Şifreler eşleşmiyor.");
            return;
        }
        if (password.length < 6) {
            setError("Şifre en az 6 karakter olmalı.");
            return;
        }

        setUpdating(true);
        setError(null);
        setMessage(null);

        try {
            const { error } = await supabase.auth.updateUser({ password: password });
            if (error) throw error;

            setMessage("Şifreniz başarıyla yenilendi! Giriş sayfasına yönlendiriliyorsunuz...");
            setTimeout(() => {
                router.push('/giris-yap');
            }, 3000);
        } catch (err) {
            console.error("Update Password Error:", err);
            setError(err.message || "Bir hata oluştu.");
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-black pt-24 pb-12 flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-8">

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-600 dark:text-emerald-400">
                        <Shield size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Yeni Şifre Belirle</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
                        Lütfen yeni şifrenizi giriniz.
                    </p>
                </div>

                {message && (
                    <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm rounded-xl border border-green-100 dark:border-green-900/50 flex items-start gap-3">
                        <Check className="shrink-0 mt-0.5" size={18} />
                        <p>{message}</p>
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 text-sm rounded-xl border border-red-100 dark:border-red-900/50 flex items-start gap-3">
                        <AlertCircle className="shrink-0 mt-0.5" size={18} />
                        <p>{error}</p>
                    </div>
                )}

                {!message && (
                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Yeni Şifre</label>
                            <input
                                type="password"
                                required
                                minLength={6}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all dark:text-white"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Yeni Şifre (Tekrar)</label>
                            <input
                                type="password"
                                required
                                minLength={6}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all dark:text-white"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={updating || !!error}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-200 dark:shadow-none transition-all"
                        >
                            {updating ? 'Kaydediliyor...' : 'Şifreyi Yenile'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
