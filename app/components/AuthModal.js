"use client";

import { X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function AuthModal({ isOpen, onClose }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || !isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 shadow-2xl transform transition-all scale-100 border border-slate-100 dark:border-slate-800">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="text-center mt-2">
                    <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600 dark:text-indigo-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 14c1.49-1.28 3.6-2.34 3.6-4.44C22.6 7.16 20.79 5.5 18.88 5.5c-1.65 0-3.1 1-3.88 2.6H9c-.78-1.6-2.23-2.6-3.88-2.6C3.21 5.5 1.4 7.16 1.4 9.56c0 2.1 2.11 3.16 3.6 4.44 1.8 1.54 3.2 2.7 5.2 4.4 2-1.7 3.4-2.86 5.2-4.4" />
                        </svg>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                        KıyasGO Ailesine Katılın
                    </h3>

                    <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                        Ürünleri favorilerinize eklemek ve fiyat indirimlerinden anında haberdar olmak için giriş yapın veya kayıt olun.
                    </p>

                    <div className="space-y-3">
                        <Link
                            href="/giris-yap"
                            className="flex items-center justify-center w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all transform active:scale-95 shadow-lg shadow-indigo-200 dark:shadow-none"
                        >
                            Giriş Yap
                        </Link>

                        <Link
                            href="/kayit-ol"
                            className="flex items-center justify-center w-full py-3.5 px-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all active:scale-95"
                        >
                            Kayıt Ol
                        </Link>
                    </div>

                    <button
                        onClick={onClose}
                        className="mt-6 text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium transition-colors"
                    >
                        Belki Daha Sonra
                    </button>
                </div>
            </div>
        </div>
    );
}
