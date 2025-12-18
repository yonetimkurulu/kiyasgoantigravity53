"use client";

import React from 'react';
import { Menu, TrendingUp, Tv, Check, Zap } from 'lucide-react';
import { ELECTRONICS_SUBCATEGORIES, HOME_OFFICE_SUBCATEGORIES } from '../data';

const FilterSidebar = ({
    activeTab,
    activeSubcategory,
    priceRange,
    setPriceRange,
    selectedStorage,
    setSelectedStorage,
    router,
    searchParams,
    mergedProducts, // Required for calculating brand counts dynamically
    onClose // Optional: to close modal on selection
}) => {

    // --- LOGIC EXTRACTED FROM ClientKiyasGo.js ---
    let catsToShow = [];
    let activeParent = ELECTRONICS_SUBCATEGORIES.find(c => c.id === activeTab);
    let headerTitle = "Kategoriler";

    // If activeTab is 'elektronik' or similar
    if (!activeParent && activeTab !== 'anasayfa') {
        activeParent = ELECTRONICS_SUBCATEGORIES.find(c => c.id === activeTab) || HOME_OFFICE_SUBCATEGORIES.find(c => c.id === activeTab);
    }

    if (activeSubcategory) {
        // Find parent of this sub
        const parent = ELECTRONICS_SUBCATEGORIES.find(p => p.subIds?.includes(activeSubcategory)) ||
            ELECTRONICS_SUBCATEGORIES.find(p => p.children?.some(c => c.id === activeSubcategory));
        if (parent) {
            activeParent = parent;
            headerTitle = parent.label;
            if (parent.children) catsToShow = parent.children;
            else if (parent.subIds) catsToShow = parent.subIds.map(id => ({ id, label: id }));
        }
    } else if (activeParent && activeParent.children) {
        headerTitle = activeParent.label;
        catsToShow = activeParent.children;
    } else {
        catsToShow = ELECTRONICS_SUBCATEGORIES;
    }

    // Compute Brands Facet
    const brandParam = searchParams.get('brand');
    const brandCounts = {};
    const baseList = activeSubcategory
        ? mergedProducts.filter(p => p.subcategory === activeSubcategory || (ELECTRONICS_SUBCATEGORIES.find(s => s.id === activeSubcategory)?.subIds?.includes(p.subcategory)))
        : mergedProducts.filter(p => p.category === activeTab);

    baseList.forEach(p => {
        const brand = p.name ? p.name.split(' ')[0] : 'Diğer';
        brandCounts[brand] = (brandCounts[brand] || 0) + 1;
    });

    const topBrands = Object.entries(brandCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    return (
        <div className="space-y-6">

            {/* 1. Category Navigation */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                {activeSubcategory ? (
                    <div className="space-y-6">
                        {/* Price Filter */}
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                <TrendingUp size={18} className="text-emerald-500" /> Fiyat Aralığı
                            </h3>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    placeholder="Min TL"
                                    value={priceRange.min}
                                    onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-indigo-500"
                                />
                                <span className="text-slate-400">-</span>
                                <input
                                    type="number"
                                    placeholder="Max TL"
                                    value={priceRange.max}
                                    onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-indigo-500"
                                />
                            </div>
                        </div>

                        {/* Spec Filters (Storage) */}
                        {['cep-telefonu', 'tablet', 'laptop'].includes(activeSubcategory) && (
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                    <Tv size={18} className="text-indigo-500" /> Dahili Hafıza
                                </h3>
                                <div className="space-y-2">
                                    {['64 GB', '128 GB', '256 GB', '512 GB', '1 TB'].map((storage) => (
                                        <label key={storage} className="flex items-center gap-2 cursor-pointer group">
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedStorage.includes(storage) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 dark:border-slate-600 group-hover:border-indigo-400'}`}>
                                                {selectedStorage.includes(storage) && <Check size={14} className="text-white" />}
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={selectedStorage.includes(storage)}
                                                onChange={() => {
                                                    setSelectedStorage(prev =>
                                                        prev.includes(storage)
                                                            ? prev.filter(s => s !== storage)
                                                            : [...prev, storage]
                                                    )
                                                }}
                                            />
                                            <span className="text-sm text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 transition-colors">{storage}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Parent Category List */
                    <>
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <Menu size={18} /> {headerTitle}
                        </h3>
                        <div className="space-y-1 max-h-60 overflow-y-auto scrollbar-thin">
                            {catsToShow.map(c => {
                                const isActive = activeSubcategory === c.id;
                                return (
                                    <button
                                        key={c.id}
                                        onClick={() => {
                                            router.push(`/${c.id}`);
                                            if (onClose) onClose();
                                        }}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-colors ${isActive ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                    >
                                        <span>{c.label || c.id}</span>
                                        {isActive && <Check size={14} />}
                                    </button>
                                )
                            })}
                        </div>
                    </>
                )}
            </div>

            {/* 2. Brand Filter */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Zap size={18} className="text-amber-500" /> Markalar
                </h3>
                <div className="space-y-1">
                    {topBrands.map(([brand, count]) => {
                        const isSelected = brandParam && brand.toLowerCase() === brandParam.toLowerCase();
                        return (
                            <button
                                key={brand}
                                onClick={() => {
                                    const newParams = new URLSearchParams(searchParams.toString());
                                    if (isSelected) newParams.delete('brand');
                                    else newParams.set('brand', brand);
                                    router.push(`?${newParams.toString()}`);
                                    if (onClose) onClose();
                                }}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-colors ${isSelected ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold ring-1 ring-indigo-200 dark:ring-indigo-800' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                            >
                                <span>{brand}</span>
                                <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-500">{count}</span>
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};

export default FilterSidebar;
