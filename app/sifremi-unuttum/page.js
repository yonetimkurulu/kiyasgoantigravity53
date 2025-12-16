"use client";

import { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { Mail, Check, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const { supabase } = useAuth();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/sifre-yenile`,
            });

            if (error) throw error;

            setMessage("Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen spam kutunuzu da kontrol edin.");
        } catch (err) {
            console.error("Reset Password Error:", err);
            setError(err.message || "Bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-black pt-24 pb-12 flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-8">

                <Link href="/giris-yap" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-6 transition-colors text-sm font-medium">
                    <ArrowLeft size={16} /> Giriş Yap'a Dön
                </Link>

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600 dark:text-indigo-400">
                        <Mail size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Şifremi Unuttum</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
                        E-posta adresinizi girin, size şifrenizi sıfırlamanız için bir bağlantı gönderelim.
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

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">E-posta</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="email"
                                required
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white"
                                placeholder="ornek@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all"
                    >
                        {loading ? 'Gönderiliyor...' : 'Sıfırlama Linki Gönder'}
                    </button>
                </form>
            </div>
        </div>
    );
}
