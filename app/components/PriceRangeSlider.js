"use client";

import React, { useMemo } from 'react';
import { TrendingUp } from 'lucide-react';

export default function PriceRangeSlider({
    products = [],
    minPrice,
    maxPrice,
    onMinChange,
    onMaxChange,
    onRangeSelect
}) {
    // Calculate price distribution for histogram
    const priceStats = useMemo(() => {
        const prices = products
            .map(p => p.price)
            .filter(p => p && p > 0)
            .sort((a, b) => a - b);

        if (prices.length === 0) {
            return { min: 0, max: 100000, buckets: [], ranges: [] };
        }

        const min = prices[0];
        const max = prices[prices.length - 1];
        const bucketCount = 15;
        const step = (max - min) / bucketCount;

        // Create buckets for histogram
        const buckets = Array.from({ length: bucketCount }, (_, i) => {
            const bucketMin = min + (step * i);
            const bucketMax = min + (step * (i + 1));
            const count = prices.filter(p => p >= bucketMin && p < bucketMax).length;
            return { min: bucketMin, max: bucketMax, count };
        });

        const maxCount = Math.max(...buckets.map(b => b.count), 1);
        const normalizedBuckets = buckets.map(b => ({
            ...b,
            height: Math.max(10, (b.count / maxCount) * 100) // Min 10% height for visibility
        }));

        // Create smart price ranges based on distribution
        const ranges = [];
        const rangeStep = (max - min) / 4;
        for (let i = 0; i < 4; i++) {
            const rangeMin = Math.round(min + (rangeStep * i));
            const rangeMax = i === 3 ? max : Math.round(min + (rangeStep * (i + 1)));
            const count = prices.filter(p => p >= rangeMin && p <= rangeMax).length;

            let label;
            if (i === 0) label = `${formatPrice(rangeMax)} altı`;
            else if (i === 3) label = `${formatPrice(rangeMin)} ve üstü`;
            else label = `${formatPrice(rangeMin)} - ${formatPrice(rangeMax)}`;

            ranges.push({ min: rangeMin, max: rangeMax, label, count });
        }

        return { min, max, buckets: normalizedBuckets, ranges };
    }, [products]);

    const formatPrice = (price) => {
        if (price >= 1000000) return `${(price / 1000000).toFixed(1)}M`;
        if (price >= 1000) return `${Math.round(price / 1000)}K`;
        return price.toString();
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp size={18} className="text-emerald-500" />
                Fiyat Aralığı
            </h3>

            {/* Histogram */}
            {priceStats.buckets.length > 0 && (
                <div className="h-12 flex items-end gap-0.5 px-1">
                    {priceStats.buckets.map((bucket, i) => (
                        <div
                            key={i}
                            className="flex-1 bg-indigo-200 dark:bg-indigo-900/50 hover:bg-indigo-400 dark:hover:bg-indigo-700 rounded-t transition-colors cursor-pointer"
                            style={{ height: `${bucket.height}%` }}
                            title={`${formatPrice(bucket.min)} - ${formatPrice(bucket.max)}: ${bucket.count} ürün`}
                        />
                    ))}
                </div>
            )}

            {/* Min-Max Inputs */}
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <input
                        type="number"
                        placeholder={priceStats.min ? formatPrice(priceStats.min) : "Min"}
                        value={minPrice || ''}
                        onChange={(e) => onMinChange(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">₺</span>
                </div>
                <span className="text-slate-300 dark:text-slate-600 font-bold">—</span>
                <div className="relative flex-1">
                    <input
                        type="number"
                        placeholder={priceStats.max ? formatPrice(priceStats.max) : "Max"}
                        value={maxPrice || ''}
                        onChange={(e) => onMaxChange(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">₺</span>
                </div>
                <button
                    onClick={() => {
                        if (minPrice || maxPrice) {
                            onMinChange('');
                            onMaxChange('');
                        }
                    }}
                    className="p-2.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg transition-colors"
                >
                    {minPrice || maxPrice ? '✕' : '→'}
                </button>
            </div>

            {/* Quick Range Buttons */}
            {priceStats.ranges.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                    {priceStats.ranges.map((range, i) => (
                        <button
                            key={i}
                            onClick={() => onRangeSelect && onRangeSelect(range.min, range.max)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${minPrice == range.min && maxPrice == range.max
                                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-semibold ring-1 ring-indigo-200 dark:ring-indigo-800'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                        >
                            <span className="flex items-center gap-2">
                                <span className={`w-4 h-4 rounded border flex items-center justify-center ${minPrice == range.min && maxPrice == range.max
                                        ? 'bg-indigo-600 border-indigo-600'
                                        : 'border-slate-300 dark:border-slate-600'
                                    }`}>
                                    {minPrice == range.min && maxPrice == range.max && (
                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </span>
                                {range.label}
                            </span>
                            <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-500">
                                {range.count}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
