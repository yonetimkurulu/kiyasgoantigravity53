'use client';

import React from 'react';
import { useComparison } from '../context/ComparisonContext';
import { X, ArrowRight, Zap } from 'lucide-react';
import Link from 'next/link';

export default function ComparisonBar() {
    const { selectedProducts, removeFromComparison, clearComparison } = useComparison();

    if (selectedProducts.length === 0) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 animate-in slide-in-from-bottom duration-300">
            <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">

                <div className="flex items-center gap-4 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                    {selectedProducts.map((product) => (
                        <div key={product.id} className="relative group shrink-0">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-2xl border border-slate-200 dark:border-slate-700">
                                {product.image}
                            </div>
                            <button
                                onClick={() => removeFromComparison(product.id)}
                                className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-0.5 shadow-sm hover:bg-rose-600 transition-colors"
                            >
                                <X size={14} />
                            </button>
                            <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400 absolute -bottom-5 left-0 right-0 text-center truncate w-16">
                                {product.name.split(' ')[0]}
                            </span>
                        </div>
                    ))}

                    {selectedProducts.length < 3 && (
                        <div className="w-16 h-16 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex flex-col items-center justify-center text-slate-400 text-xs text-center p-1">
                            <span>{3 - selectedProducts.length} ürün</span>
                            <span>daha</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <button
                        onClick={clearComparison}
                        className="text-sm text-slate-500 hover:text-rose-500 underline hidden md:block"
                    >
                        Temizle
                    </button>
                    <Link
                        href="/kiyasgo/kiyasla"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none hover:shadow-xl hover:-translate-y-0.5 transition-all"
                    >
                        <Zap size={18} fill="currentColor" />
                        <span className="hidden sm:inline">Kıyasla</span>
                        <span className="sm:hidden">Kıyasla ({selectedProducts.length})</span>
                        <ArrowRight size={18} />
                    </Link>
                </div>
            </div>
        </div>
    );
}
