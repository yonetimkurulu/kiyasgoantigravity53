"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, TrendingUp, Tv, Check, Zap, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { ELECTRONICS_SUBCATEGORIES, HOME_OFFICE_SUBCATEGORIES, CATEGORY_FILTERS, getFiltersForCategory } from '../data';
import PriceRangeSlider from './PriceRangeSlider';

const FilterSidebar = ({
    activeTab,
    activeSubcategory,
    priceRange,
    setPriceRange,
    selectedFilters = {},
    setSelectedFilters,
    router,
    searchParams,
    mergedProducts,
    onClose
}) => {
    const [expandedSections, setExpandedSections] = useState({});

    // Toggle section expansion
    const toggleSection = (key) => {
        setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // Get category-specific filters
    const categoryFilters = getFiltersForCategory(activeSubcategory);

    // --- Category Navigation Logic ---
    let catsToShow = [];
    let activeParent = ELECTRONICS_SUBCATEGORIES.find(c => c.id === activeTab);
    let headerTitle = "Kategoriler";

    if (!activeParent && activeTab !== 'anasayfa') {
        activeParent = ELECTRONICS_SUBCATEGORIES.find(c => c.id === activeTab) || HOME_OFFICE_SUBCATEGORIES.find(c => c.id === activeTab);
    }

    if (activeSubcategory) {
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
        .slice(0, 12);

    // Handle filter selection
    const handleFilterSelect = (filterKey, value) => {
        if (!setSelectedFilters) return;

        setSelectedFilters(prev => {
            const currentValues = prev[filterKey] || [];
            if (currentValues.includes(value)) {
                return { ...prev, [filterKey]: currentValues.filter(v => v !== value) };
            } else {
                return { ...prev, [filterKey]: [...currentValues, value] };
            }
        });
    };

    // Check if filter value is selected
    const isFilterSelected = (filterKey, value) => {
        return (selectedFilters[filterKey] || []).includes(value);
    };

    return (
        <div className="space-y-4">

            {/* PRICE FILTER - Always show when in subcategory */}
            {activeSubcategory && (
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <PriceRangeSlider
                        products={baseList}
                        minPrice={priceRange.min}
                        maxPrice={priceRange.max}
                        onMinChange={(val) => setPriceRange({ ...priceRange, min: val })}
                        onMaxChange={(val) => setPriceRange({ ...priceRange, max: val })}
                        onRangeSelect={(min, max) => setPriceRange({ min, max })}
                    />
                </div>
            )}

            {/* CATEGORY-SPECIFIC FILTERS */}
            {activeSubcategory && categoryFilters.length > 0 && (
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                    {categoryFilters.map((filter) => {
                        if (filter.dynamic) return null; // Skip dynamic filters (handled separately)

                        const isExpanded = expandedSections[filter.key] !== false; // Default expanded
                        const selectedCount = (selectedFilters[filter.key] || []).length;

                        return (
                            <div key={filter.key} className="border-b border-slate-50 dark:border-slate-800 last:border-0 pb-4 last:pb-0">
                                <button
                                    onClick={() => toggleSection(filter.key)}
                                    className="w-full flex items-center justify-between py-2 text-left group"
                                >
                                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                                        <Filter size={16} className="text-indigo-500" />
                                        {filter.label}
                                        {selectedCount > 0 && (
                                            <span className="text-xs bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded-full">
                                                {selectedCount}
                                            </span>
                                        )}
                                    </h3>
                                    {isExpanded ? (
                                        <ChevronUp size={16} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                                    ) : (
                                        <ChevronDown size={16} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                                    )}
                                </button>

                                {isExpanded && (
                                    <div className="space-y-1 pt-2 animate-in slide-in-from-top-2 duration-200">
                                        {filter.options.map((option) => (
                                            <label
                                                key={option}
                                                className="flex items-center gap-2.5 cursor-pointer group/item py-1.5 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                            >
                                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isFilterSelected(filter.key, option)
                                                        ? 'bg-indigo-600 border-indigo-600'
                                                        : 'border-slate-300 dark:border-slate-600 group-hover/item:border-indigo-400'
                                                    }`}>
                                                    {isFilterSelected(filter.key, option) && (
                                                        <Check size={12} className="text-white" />
                                                    )}
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={isFilterSelected(filter.key, option)}
                                                    onChange={() => handleFilterSelect(filter.key, option)}
                                                />
                                                <span className={`text-sm transition-colors ${isFilterSelected(filter.key, option)
                                                        ? 'text-indigo-600 dark:text-indigo-400 font-medium'
                                                        : 'text-slate-600 dark:text-slate-300 group-hover/item:text-indigo-600'
                                                    }`}>
                                                    {option}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* CATEGORY NAVIGATION - Show when no subcategory selected */}
            {!activeSubcategory && (
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <Menu size={18} /> {headerTitle}
                    </h3>
                    <div className="space-y-1 max-h-60 overflow-y-auto scrollbar-thin">
                        {catsToShow.map(c => {
                            const isActive = activeSubcategory === c.id;
                            return (
                                <Link
                                    key={c.id}
                                    href={`/${c.id}`}
                                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-colors ${isActive
                                            ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                        }`}
                                    onClick={onClose}
                                >
                                    <span>{c.label || c.id}</span>
                                    {isActive && <Check size={14} />}
                                </Link>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* BRAND FILTER */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <button
                    onClick={() => toggleSection('brands')}
                    className="w-full flex items-center justify-between py-1 text-left group"
                >
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Zap size={18} className="text-amber-500" /> Markalar
                    </h3>
                    {expandedSections['brands'] === false ? (
                        <ChevronDown size={16} className="text-slate-400" />
                    ) : (
                        <ChevronUp size={16} className="text-slate-400" />
                    )}
                </button>

                {expandedSections['brands'] !== false && (
                    <div className="space-y-1 mt-3 max-h-64 overflow-y-auto">
                        {topBrands.map(([brand, count]) => {
                            const isSelected = brandParam && brand.toLowerCase() === brandParam.toLowerCase();
                            const newParams = new URLSearchParams(searchParams.toString());
                            if (isSelected) newParams.delete('brand');
                            else newParams.set('brand', brand);
                            return (
                                <Link
                                    key={brand}
                                    href={`?${newParams.toString()}`}
                                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-colors ${isSelected
                                            ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 font-bold ring-1 ring-amber-200 dark:ring-amber-800'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                        }`}
                                    onClick={onClose}
                                >
                                    <span>{brand}</span>
                                    <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-500">{count}</span>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* CLEAR FILTERS BUTTON */}
            {(Object.keys(selectedFilters).some(k => selectedFilters[k]?.length > 0) || priceRange.min || priceRange.max || brandParam) && (
                <button
                    onClick={() => {
                        if (setSelectedFilters) setSelectedFilters({});
                        setPriceRange({ min: '', max: '' });
                        const newParams = new URLSearchParams(searchParams.toString());
                        newParams.delete('brand');
                        router.push(`?${newParams.toString()}`);
                    }}
                    className="w-full py-3 text-sm font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                    <span>✕</span> Tüm Filtreleri Temizle
                </button>
            )}
        </div>
    );
};

export default FilterSidebar;
