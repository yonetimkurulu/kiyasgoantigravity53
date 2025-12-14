"use client";

import React, { useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ChevronRight, Filter, SortAsc } from 'lucide-react';
import ProductCard from './ProductCard';
import Header from './Header';
import { ELECTRONICS_SUBCATEGORIES } from '@/app/data';

export default function SearchResults({ allProducts }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const query = searchParams.get('q') || '';
    const categoryFilter = searchParams.get('cat');

    // Local state for input to avoid aggressive routing while typing
    const [term, setTerm] = useState(query);

    React.useEffect(() => {
        setTerm(query);
    }, [query]);

    // 1. Filter Logic
    const filteredProducts = useMemo(() => {
        let results = allProducts.filter(p =>
            p.name.toLowerCase().includes(query.toLowerCase())
        );

        if (categoryFilter) {
            results = results.filter(p => p.subcategory === categoryFilter);
        }

        return results;
    }, [allProducts, query, categoryFilter]);

    // 2. Calculate Categories Facet
    const categoriesFacet = useMemo(() => {
        const counts = {};
        allProducts.filter(p => p.name.toLowerCase().includes(query.toLowerCase())).forEach(p => {
            const sub = p.subcategory || 'diger';
            counts[sub] = (counts[sub] || 0) + 1;
        });

        return Object.entries(counts)
            .map(([id, count]) => {
                const meta = ELECTRONICS_SUBCATEGORIES.find(c => c.id === id) ||
                    ELECTRONICS_SUBCATEGORIES.find(c => c.children?.some(child => child.id === id))?.children?.find(ch => ch.id === id) ||
                    { label: id, id };
                return { ...meta, count };
            })
            .sort((a, b) => b.count - a.count);
    }, [allProducts, query]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <Header searchTerm={term} onSearchChange={setTerm} />

            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex gap-8">

                    {/* LEFT SIDEBAR FILTERS */}
                    <div className="w-64 hidden lg:block shrink-0 space-y-8">
                        {/* Categories */}
                        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <Filter size={18} /> Kategoriler
                            </h3>
                            <div className="space-y-1">
                                {categoriesFacet.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => router.push(`/arama?q=${query}&cat=${cat.id}`)}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-colors ${categoryFilter === cat.id
                                            ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 font-bold'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                            }`}
                                    >
                                        <span className="truncate">{cat.label}</span>
                                        <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-500">{cat.count}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Price Filter Mockup */}
                        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-4 text-sm uppercase tracking-wider">Fiyat Aralığı</h3>
                            <div className="flex items-center gap-2">
                                <input type="number" placeholder="En Az" className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 dark:bg-slate-800 dark:border-slate-700" />
                                <span className="text-slate-400">-</span>
                                <input type="number" placeholder="En Çok" className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 dark:bg-slate-800 dark:border-slate-700" />
                            </div>
                        </div>
                    </div>

                    {/* RIGHT CONTENT */}
                    <div className="flex-1">
                        {/* Top Bar */}
                        <div className="flex items-center justify-between mb-6 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                            <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                                "{query}" için <span className="text-indigo-600">{filteredProducts.length}</span> sonuç bulundu
                            </h1>

                            <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-500">Sırala:</span>
                                <select className="bg-slate-50 dark:bg-slate-800 border-none text-sm font-bold rounded-lg px-3 py-2 outline-none cursor-pointer hover:bg-slate-100 transition-colors">
                                    <option>Akıllı Sıralama</option>
                                    <option>En Düşük Fiyat</option>
                                    <option>En Yüksek Fiyat</option>
                                </select>
                            </div>
                        </div>

                        {/* Product List */}
                        <div className="space-y-4">
                            {filteredProducts.map(product => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    variant="detailed-list"
                                    layout="horizontal" // Force horizontal list look
                                />
                            ))}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
