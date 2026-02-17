"use client";

import Image from 'next/image';
import { Check, Plus, Heart, ArrowRight } from 'lucide-react';

const ProductCard = ({
    product,
    isSelected,
    onToggleCompare,
    onClick,
    onToggleFavorite,
    isFavorite,
    className = '',
    variant = 'card'
}) => {
    const isList = variant === 'list';

    if (!product) return null;

    if (variant === 'detailed-list') {
        const sortedPrices = (product.prices || []).sort((a, b) => a.price - b.price).slice(0, 3);
        // Prioritize sortedPrices[0] as it is the calculated best offer
        const bestPrice = sortedPrices[0]?.price || product.price || 0;

        return (
            <div
                onClick={onClick}
                className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-indigo-100/50 dark:hover:shadow-indigo-900/20 transition-all duration-300 group cursor-pointer relative overflow-hidden flex ${variant === 'detailed-list' ? 'flex-row' : 'flex-col lg:flex-col'} gap-3 sm:gap-4 p-3 sm:p-4 ${isSelected ? 'border-indigo-500 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-950' : ''
                    } ${className}`}
            >
                {/* 1. Image Section */}
                <div className="w-24 sm:w-48 aspect-square shrink-0 relative flex items-center justify-center bg-white rounded-xl p-2 sm:p-4">
                    {/* Rating Badge */}
                    <div className="absolute bottom-2 right-2 bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-200 z-10">
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                        {Number(product.rating || 4.5).toFixed(1)}
                    </div>

                    <Image
                        src={product.image}
                        alt={product.name}
                        width={120}
                        height={120}
                        sizes="(max-width: 640px) 96px, 192px"
                        className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-500 mix-blend-multiply dark:mix-blend-normal max-w-[120px] max-h-[120px] lg:max-w-none lg:max-h-none"
                        loading="lazy"
                        unoptimized={product.image?.includes('supabase')}
                    />
                    {onToggleFavorite && (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onToggleFavorite(product);
                            }}
                            className={`absolute top-2 right-2 p-1.5 rounded-full shadow-sm backdrop-blur-md transition-all duration-300 ${isFavorite
                                ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-500 scale-110'
                                : 'bg-white/90 dark:bg-slate-800/90 text-slate-400 hover:text-rose-500 hover:scale-110'
                                }`}
                        >
                            <Heart size={16} strokeWidth={2.5} fill={isFavorite ? "currentColor" : "none"} />
                        </button>
                    )}
                </div>

                {/* 2. Content Section */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                        {/* Title (Full Width) */}
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {product.name.replace(/^Apple\s+(iPhone|iPad|MacBook)/, '$1')}
                        </h3>

                        {/* Specs */}
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 truncate">
                            {product.desc || product.specs?.slice(0, 3).join(' • ')}
                        </p>

                        {/* Mobile Price (Unique KıyasGO Style) */}
                        <div className="lg:hidden mb-3 mt-1 inline-flex flex-col items-start bg-slate-50 dark:bg-slate-800 rounded-lg px-2 py-1 border border-slate-100 dark:border-slate-700">
                            <div className="text-[9px] text-indigo-500 dark:text-indigo-400 font-bold uppercase tracking-wider mb-0.5">En İyi Fiyat</div>
                            <div className="text-xl font-black text-slate-900 dark:text-white leading-none">
                                {bestPrice.toLocaleString('tr-TR')} <span className="text-xs font-bold text-slate-400">₺</span>
                            </div>
                        </div>
                    </div>

                    {/* Desktop Price Boxes (Hidden on Mobile) */}
                    <div className="hidden sm:flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {/* ... existing price boxes code ... */}
                        <div className="min-w-[120px] rounded-lg border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50 dark:bg-indigo-900/20 p-2 flex flex-col items-center justify-center text-center">
                            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold mb-0.5">{sortedPrices[0]?.store || 'En Ucuz'}</span>
                            <span className="text-sm font-black text-indigo-700 dark:text-indigo-300">{bestPrice.toLocaleString('tr-TR')} ₺</span>
                            <span className="text-[9px] text-green-600 dark:text-green-500 flex items-center gap-0.5 mt-1">
                                <Check size={10} /> Ücretsiz Kargo
                            </span>
                        </div>
                        {sortedPrices.slice(0, 2).map((p, idx) => (
                            <div key={idx} className="min-w-[120px] rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/50 p-2 flex flex-col items-center justify-center text-center">
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mb-0.5">{p.store || 'Diğer'}</span>
                                <span className={`text-sm font-bold ${p.color || 'text-slate-700 dark:text-slate-300'}`}>{(p.price || 0).toLocaleString('tr-TR')} ₺</span>
                                <span className="text-[9px] text-slate-400 mt-1">Satıcıya Git</span>
                            </div>
                        ))}
                    </div>

                    {/* Mobile Action Buttons (Row) - Styled */}
                    <div className="flex lg:hidden items-center gap-2 mt-auto border-t border-slate-50 dark:border-slate-800/50 pt-2">
                        <button className="flex-1 bg-indigo-600 active:bg-indigo-700 text-white rounded-lg py-2.5 text-xs font-bold shadow-sm shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-1.5 transition-transform active:scale-95">
                            Ürüne Git <ArrowRight size={14} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onToggleCompare(product); }}
                            className={`px-3 py-2.5 rounded-lg border transition-colors active:scale-95 ${isSelected ? 'bg-green-50 text-green-600 border-green-200' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}
                        >
                            {isSelected ? <Check size={16} /> : <Plus size={16} />}
                        </button>
                    </div>
                </div>

                {/* 3. Action Section (Desktop Only) */}
                <div className={`hidden lg:flex w-48 border-l border-slate-100 dark:border-slate-800 pl-4 flex-col items-center justify-center gap-2 shrink-0`}>
                    <div className="text-center block">
                        <span className="text-xs text-slate-400 block mb-1">En Uygun Fiyat</span>
                        <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                            {bestPrice.toLocaleString('tr-TR')} <span className="text-sm font-bold text-slate-500">₺</span>
                        </span>
                    </div>

                    <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 px-4 font-bold text-sm shadow-lg shadow-indigo-200 dark:shadow-none hover:shadow-xl transition-all flex items-center justify-center gap-2">
                        Ürüne Git <ArrowRight size={16} />
                    </button>

                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onToggleCompare(product);
                        }}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${isSelected
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50'
                            }`}
                    >
                        {isSelected ? <><Check size={14} /> Karşılaştırmaya Eklendi</> : <><Plus size={14} /> Karşılaştır</>}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            onClick={onClick}
            className={`bg-white dark:bg-slate-900 rounded-2xl border shadow-sm hover:shadow-xl hover:shadow-indigo-100/50 dark:hover:shadow-indigo-900/20 hover:-translate-y-1.5 transition-all duration-300 group cursor-pointer relative overflow-hidden ${isSelected ? 'border-indigo-500 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-950' : 'border-slate-100 dark:border-slate-800'
                } ${isList ? 'flex gap-4 p-2' : ''} ${className}`}
        >
            <div className={`bg-white p-4 relative overflow-hidden flex items-center justify-center ${isList ? 'w-24 h-24 rounded-xl shrink-0' : 'w-full h-40 sm:h-48 rounded-t-2xl'}`}>
                <Image
                    src={product.image}
                    alt={product.name}
                    width={140}
                    height={140}
                    sizes="(max-width: 640px) 120px, 140px"
                    className="max-w-full max-h-full object-contain transform group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                    unoptimized={product.image?.includes('supabase')}
                />
                <div className={`absolute inset-0 bg-black/0 group-hover:bg-black/2 transition-colors duration-300 ${isList ? 'rounded-xl' : ''}`}></div>

                {/* Rating Badge */}
                <div className="absolute bottom-2 right-2 bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-200 z-10">
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                    {Number(product.rating || 4.5).toFixed(1)}
                </div>
                {/* Kıyasla ve Favori butonları: Sağ-sol swap ve stopPropagation */}
                {onToggleCompare && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleCompare(product);
                        }}
                        className={`absolute top-3 left-3 p-2 rounded-full shadow-sm backdrop-blur-md transition-all duration-300 z-10 ${isSelected
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                            : 'bg-white/90 dark:bg-slate-800/90 text-slate-400 hover:text-indigo-600 hover:scale-110'
                            }`}
                        title={isSelected ? "Karşılaştırmadan Çıkar" : "Karşılaştır"}
                    >
                        {isSelected ? <Check size={18} strokeWidth={2.5} /> : <Plus size={18} strokeWidth={2.5} />}
                    </button>
                )}
                {onToggleFavorite && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(product);
                        }}
                        className={`absolute top-3 right-3 p-2 rounded-full shadow-sm backdrop-blur-md transition-all duration-300 z-10 ${isFavorite
                            ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-500 scale-110'
                            : 'bg-white/90 dark:bg-slate-800/90 text-slate-400 hover:text-rose-500 hover:scale-110'
                            }`}
                        title={isFavorite ? "Favorilerden Çıkar" : "Favoriye Ekle"}
                    >
                        <Heart size={18} strokeWidth={2.5} fill={isFavorite ? "currentColor" : "none"} />
                    </button>
                )}
            </div>

            <div className={`p-3 sm:p-4 flex flex-col justify-between flex-1 min-w-0 ${isList ? 'py-2' : ''}`}>
                <div>
                    <h3 className={`font-bold text-slate-900 dark:text-white leading-tight mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors ${isList ? 'text-sm line-clamp-2' : 'text-sm sm:text-base line-clamp-2 min-h-[2.5rem]'}`}>
                        {product.name.replace(/^Apple\s+(iPhone|iPad|MacBook)/, '$1')}
                    </h3>
                </div>
                <div className="flex items-center justify-between mt-auto gap-3">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-medium">En Ucuz</span>
                        <span className="text-lg sm:text-xl font-bold text-indigo-600 dark:text-indigo-400">
                            {(product.price || 0).toLocaleString('tr-TR')} ₺
                        </span>
                    </div>
                    <div className={`flex items-center gap-2 ${isList ? 'mb-1 mr-[-6px]' : ''}`}>
                        <div className={`w-10 h-10 rounded-full bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none group-hover:scale-110 transition-transform`}>
                            <ArrowRight size={18} />
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default ProductCard;
