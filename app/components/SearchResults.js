"use client";

import React, { useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ChevronRight, Filter, SortAsc } from 'lucide-react';
import Link from 'next/link';
import { normalizeQuery, suggestCorrections } from '@/app/utils/typo';
import ProductCard from './ProductCard';
import Header from './Header';
import { ELECTRONICS_SUBCATEGORIES } from '@/app/data';
import { useComparison } from '../context/ComparisonContext';

export default function SearchResults({ allProducts }) {
    const { selectedProducts, addToComparison, removeFromComparison } = useComparison();
    const searchParams = useSearchParams();
    const router = useRouter();
    const query = searchParams.get('q') || '';
    const categoryFilter = searchParams.get('cat');

    // Local state for input to avoid aggressive routing while typing
    const [term, setTerm] = useState(query);

    React.useEffect(() => {
        setTerm(query);
    }, [query]);

    // Use centralized typo utilities to suggest corrections
    const suggestion = useMemo(() => {
        if (!query || query.length < 3) return null;

        // Try fast normalize (exact replacements)
        const { normalized, changed } = normalizeQuery(query);
        if (changed) return normalized;

        // Fallback: fuzzy suggestions per token
        const corrections = suggestCorrections(query, 2); // token -> [suggestions]
        if (!corrections || Object.keys(corrections).length === 0) return null;

        const parts = query.split(/\s+/);
        const suggestedParts = parts.map(p => {
            const cleaned = p.replace(/[^\wÇÖÜŞİĞçöüşığ-]/gi, '');
            const s = corrections[p] || corrections[cleaned] || corrections[cleaned.toLowerCase()];
            if (s && s.length > 0) return s[0];
            return p;
        });
        const suggested = suggestedParts.join(' ');
        if (suggested.toLowerCase() === query.toLowerCase()) return null;
        return suggested;
    }, [query]);

    // Build a lookup map for subcategory id -> label (for searching by label like "Ekran Kartı")
    const subcategoryLabelMap = useMemo(() => {
        const map = {};
        ELECTRONICS_SUBCATEGORIES.forEach(cat => {
            // Parent category
            map[cat.id] = cat.label.toLowerCase();
            // Children
            if (cat.children) {
                cat.children.forEach(child => {
                    map[child.id] = child.label.toLowerCase();
                });
            }
        });
        return map;
    }, []);

    // Find subcategory IDs that match the query (by label)
    const matchingSubcategoryIds = useMemo(() => {
        if (!query || query.length < 2) return [];
        const lowerQuery = query.toLowerCase();
        return Object.entries(subcategoryLabelMap)
            .filter(([id, label]) => label.includes(lowerQuery) || id.includes(lowerQuery.replace(/ /g, '-')))
            .map(([id]) => id);
    }, [query, subcategoryLabelMap]);

    // 1. Filter Logic - Extended to search in name, category, subcategory, and brand
    const filteredProducts = useMemo(() => {
        if (!query || query.length < 1) {
            return categoryFilter
                ? allProducts.filter(p => p.subcategory === categoryFilter)
                : allProducts;
        }

        const lowerQuery = query.toLowerCase();

        let results = allProducts.filter(p => {
            // Match by name
            const nameMatch = p.name?.toLowerCase().includes(lowerQuery);

            // Match by subcategory id or label
            const subcategoryMatch = p.subcategory && (
                p.subcategory.toLowerCase().includes(lowerQuery.replace(/ /g, '-')) ||
                matchingSubcategoryIds.includes(p.subcategory)
            );

            // Match by category
            const categoryMatch = p.category?.toLowerCase().includes(lowerQuery);

            // Match by brand (first word of name usually)
            const brand = p.name?.split(' ')[0]?.toLowerCase();
            const brandMatch = brand && lowerQuery.includes(brand);

            return nameMatch || subcategoryMatch || categoryMatch || brandMatch;
        });

        if (categoryFilter) {
            results = results.filter(p => p.subcategory === categoryFilter);
        }

        return results;
    }, [allProducts, query, categoryFilter, matchingSubcategoryIds]);

    // 2. Calculate Categories Facet (uses same filtering logic as filteredProducts)
    const categoriesFacet = useMemo(() => {
        const counts = {};
        const lowerQuery = query.toLowerCase();

        // Use same filtering logic as filteredProducts
        const matchedProducts = query
            ? allProducts.filter(p => {
                const nameMatch = p.name?.toLowerCase().includes(lowerQuery);
                const subcategoryMatch = p.subcategory && (
                    p.subcategory.toLowerCase().includes(lowerQuery.replace(/ /g, '-')) ||
                    matchingSubcategoryIds.includes(p.subcategory)
                );
                const categoryMatch = p.category?.toLowerCase().includes(lowerQuery);
                const brand = p.name?.split(' ')[0]?.toLowerCase();
                const brandMatch = brand && lowerQuery.includes(brand);
                return nameMatch || subcategoryMatch || categoryMatch || brandMatch;
            })
            : allProducts;

        matchedProducts.forEach(p => {
            const sub = p.subcategory || 'diger';
            counts[sub] = (counts[sub] || 0) + 1;
        });

        // Helper to format slug to Title Case (e.g. "akilli-saat" -> "Akıllı Saat")
        const formatSlug = (slug) => {
            if (!slug) return '';
            return slug
                .replace(/i/g, 'İ') // Naive turkish i handling
                .split('-')
                .map(word => {
                    if (word === 've') return 've';
                    return word.charAt(0).toUpperCase() + word.slice(1);
                })
                .join(' ')
                .replace(/İ/g, 'İ');
        };

        return Object.entries(counts)
            .map(([id, count]) => {
                // Try to find in definitions
                let label = id;
                const parent = ELECTRONICS_SUBCATEGORIES.find(c => c.id === id);
                if (parent) {
                    label = parent.label;
                } else {
                    // Search in children
                    let foundChild = null;
                    for (const cat of ELECTRONICS_SUBCATEGORIES) {
                        if (cat.children) {
                            foundChild = cat.children.find(c => c.id === id);
                            if (foundChild) break;
                        }
                    }
                    if (foundChild) {
                        label = foundChild.label;
                    } else {
                        // Fallback: Prettify slug
                        label = formatSlug(id);
                    }
                }

                return { id, label, count };
            })
            .sort((a, b) => b.count - a.count);
    }, [allProducts, query, matchingSubcategoryIds]);

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

                        {/* Did You Mean? Suggestion */}
                        {filteredProducts.length === 0 && suggestion && (
                            <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center gap-3">
                                <span className="text-amber-600 dark:text-amber-400 text-2xl">💡</span>
                                <div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">Bunu mu demek istediniz?</p>
                                    <button
                                        onClick={() => router.push(`/arama?q=${encodeURIComponent(suggestion)}`)}
                                        className="text-lg font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                                    >
                                        "{suggestion}"
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Product List */}
                        <div className="space-y-4">
                            {filteredProducts.map(product => (
                                <Link
                                    key={product.id}
                                    href={`/${product.subcategory || 'elektronik'}/${product.slug || product.id}`}
                                    passHref
                                >
                                    <ProductCard
                                        product={product}
                                        variant="detailed-list"
                                        layout="horizontal" // Force horizontal list look
                                        onToggleCompare={(item) => {
                                            const exists = selectedProducts.some((p) =>
                                                String(p.id || p.slug || '').toLowerCase() === String(item.id || item.slug || '').toLowerCase()
                                            );
                                            if (exists) {
                                                removeFromComparison(item.id || item.slug || item.name);
                                            } else {
                                                addToComparison(item);
                                            }
                                        }}
                                        isSelected={selectedProducts.some((p) =>
                                            String(p.id || p.slug || '').toLowerCase() === String(product.id || product.slug || '').toLowerCase()
                                        )}
                                    />
                                </Link>
                            ))}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
