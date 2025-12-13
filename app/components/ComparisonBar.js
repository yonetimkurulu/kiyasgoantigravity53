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
            <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4 h-auto md:h-24">

                {/* Product List with Scroll */}
                <div className="flex-1 w-full overflow-x-auto no-scrollbar pb-2 md:pb-0">
                    <div className="flex items-center justify-start md:justify-center gap-4 min-w-max px-2">
                        {selectedProducts.map((product) => (
                            <div key={product.id} className="relative group flex items-center gap-3 bg-white dark:bg-slate-900 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 min-w-[160px] max-w-[200px] flex-shrink-0">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-100 dark:bg-slate-800 rounded-l-xl flex items-center justify-center text-xl shrink-0 overflow-hidden">
                                    {(product.image || '').startsWith('http') ? (
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
                                    className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 shadow-sm hover:bg-rose-600 transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100 scale-100"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}

                        {selectedProducts.length < 3 && (
                            <div className="w-10 h-10 md:w-12 md:h-12 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-500 hover:border-indigo-300 transition-colors cursor-default shrink-0" title={`${3 - selectedProducts.length} ürün daha ekleyebilirsin`}>
                                <span className="text-xs font-bold">+{3 - selectedProducts.length}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Actions */}
                <Link
                    href="/kiyasgo/kiyasla"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none hover:shadow-xl hover:-translate-y-0.5 transition-all w-full md:w-auto justify-center shrink-0"
                >
                    <Zap size={18} fill="currentColor" />
                    <span>Kıyasla</span>
                    <ArrowRight size={18} />
                </Link>
            </div>
        </div>
    );
}
