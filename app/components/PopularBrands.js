'use client';

import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

import Link from 'next/link';

const PopularBrands = ({ brands, isFullList = false }) => {
    // Limit to 6 brands if not full list
    const displayedBrands = isFullList ? brands : brands.slice(0, 6);

    return (
        <div className="w-full mb-8 relative group">
            {/* Section Header - Only show on homepage (not full list page) or if needed */}
            {!isFullList && (
                <div className="flex items-center justify-between mb-4 px-2">
                    <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
                        Popüler Markalar
                    </h2>
                    <Link
                        href="/markalar"
                        className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors group-hover/header:translate-x-1 duration-300"
                    >
                        Tümünü Gör <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            )}

            {/* Grid Container (Replaces Scroll Container) */}
            <div className="w-full px-2 md:px-0">
                <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 ${isFullList ? 'lg:grid-cols-4 xl:grid-cols-5' : ''}`}>
                    {displayedBrands.map((brand) => (
                        <a
                            href={`/marka/${brand.id}`}
                            key={brand.id}
                            className="group/card relative aspect-square w-full rounded-2xl transition-all duration-500 ease-out hover:-translate-y-2 block"
                        >
                            {/* Holographic Glow Effect */}
                            <div className="absolute -inset-0.5 bg-gradient-to-br from-indigo-500/0 via-purple-500/0 to-cyan-500/0 group-hover/card:from-indigo-500/50 group-hover/card:via-purple-500/50 group-hover/card:to-cyan-500/50 rounded-2xl blur opacity-0 group-hover/card:opacity-100 transition duration-500" />

                            {/* Glass Card Content */}
                            <div className="relative w-full h-full bg-white/80 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 rounded-2xl flex flex-col items-center justify-center p-4 overflow-hidden shadow-lg group-hover/card:shadow-indigo-500/20 group-hover/card:border-indigo-500/30 transition-all duration-300">

                                {/* Tech Grid Background Overlay */}
                                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-indigo-50/30 dark:to-indigo-900/20 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>

                                {/* Logo Container */}
                                <div className="relative w-1/2 h-1/2 mb-2 transition-transform duration-500 group-hover/card:scale-110 group-hover/card:mb-6 z-10 filter dark:invert dark:brightness-100 flex items-center justify-center">
                                    <img
                                        src={brand.logo}
                                        alt={brand.name}
                                        className="w-full h-full object-contain drop-shadow-sm"
                                    />
                                </div>

                                {/* Brand Name */}
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200 relative z-10 group-hover/card:opacity-0 transition-opacity duration-300 text-center">
                                    {brand.name}
                                </span>

                                {/* Hover Reveal Categories */}
                                <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover/card:translate-y-0 transition-transform duration-500 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-t border-indigo-100 dark:border-indigo-900/50 text-center">
                                    <div className="flex flex-wrap justify-center gap-1.5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 delay-100">
                                        {brand.categories.slice(0, 3).map((cat, i) => (
                                            <span
                                                key={i}
                                                className="text-[9px] md:text-[10px] uppercase tracking-wider font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded-sm border border-indigo-100 dark:border-indigo-800/50 hover:bg-indigo-100 dark:hover:bg-indigo-800 transition-colors"
                                            >
                                                {cat}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Corner Accents */}
                                <div className="absolute top-2 left-2 w-1.5 h-1.5 border-t border-l border-slate-300 dark:border-slate-600 group-hover/card:border-indigo-400 transition-colors duration-300" />
                                <div className="absolute top-2 right-2 w-1.5 h-1.5 border-t border-r border-slate-300 dark:border-slate-600 group-hover/card:border-purple-400 transition-colors duration-300" />
                                <div className="absolute bottom-2 left-2 w-1.5 h-1.5 border-b border-l border-slate-300 dark:border-slate-600 group-hover/card:border-cyan-400 transition-colors duration-300" />
                                <div className="absolute bottom-2 right-2 w-1.5 h-1.5 border-b border-r border-slate-300 dark:border-slate-600 group-hover/card:border-pink-400 transition-colors duration-300" />

                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PopularBrands;
