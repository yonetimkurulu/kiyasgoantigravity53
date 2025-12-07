'use client';

import React from 'react';
import { useComparison } from '../context/ComparisonContext';
import { X, ArrowRight, Zap } from 'lucide-react';
import Link from 'next/link';

export default function ComparisonBar() {
    const { selectedProducts, removeFromComparison, clearComparison } = useComparison();

    if (selectedProducts.length === 0) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] z-[60] animate-in slide-in-from-bottom duration-300">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between relative h-24">

                {/* Centered Product List */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-6 w-full justify-center pointer-events-none">
                    <div className="flex items-center gap-4 pointer-events-auto bg-slate-50/50 dark:bg-slate-800/50 p-2 rounded-2xl border border-slate-100 dark:border-slate-700/50 backdrop-blur-sm">
                        {selectedProducts.map((product) => (
                            <div key={product.id} className="relative group flex items-center gap-3 bg-white dark:bg-slate-900 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 min-w-[180px] max-w-[220px]">
                                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-l-xl flex items-center justify-center text-xl shrink-0 overflow-hidden">
                                    {product.image.startsWith('http') ? (
                                        <img src={product.image} alt={product.name} className="w-full h-full object-contain p-1" />
                                    ) : (
                                        <span>{product.image}</span>
                                    )}
                                </div>
                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-tight py-2 line-clamp-2">
                                    {product.name}
                                </span>
                                <button
                                    onClick={() => removeFromComparison(product.id)}
                                    className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 shadow-sm hover:bg-rose-600 transition-colors opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}

                        {selectedProducts.length < 3 && (
                            <div className="w-12 h-12 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-500 hover:border-indigo-300 transition-colors cursor-default" title={`${3 - selectedProducts.length} ürün daha ekleyebilirsin`}>
                                <span className="text-xs font-bold">+{3 - selectedProducts.length}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-4 ml-auto z-10">
                    <button
                        onClick={clearComparison}
                        className="text-xs font-medium text-slate-500 hover:text-rose-500 transition-colors hidden md:block"
                    >
                        Listeyi Temizle
                    </button>
                    <Link
                        href="/kiyasgo/kiyasla"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none hover:shadow-xl hover:-translate-y-0.5 transition-all"
                    >
                        <Zap size={18} fill="currentColor" />
                        <span className="hidden sm:inline">Kıyasla</span>
                        <ArrowRight size={18} />
                    </Link>
                </div>
            </div>
        </div>
    );
}
