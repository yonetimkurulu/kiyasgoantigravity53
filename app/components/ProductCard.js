"use client";

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

    return (
        <div
            onClick={onClick}
            className={`bg-white dark:bg-slate-900 rounded-2xl border shadow-sm hover:shadow-xl hover:shadow-indigo-100/50 dark:hover:shadow-indigo-900/20 hover:-translate-y-1.5 transition-all duration-300 group cursor-pointer relative overflow-hidden ${isSelected ? 'border-indigo-500 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-950' : 'border-slate-100 dark:border-slate-800'
                } ${isList ? 'flex gap-4 p-2' : ''} ${className}`}
        >
            <div className={`aspect-square bg-white p-4 relative overflow-hidden ${isList ? 'w-24 h-24 rounded-xl shrink-0' : 'w-full'}`}>
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-500"
                />
                <div className={`absolute inset-0 bg-black/0 group-hover:bg-black/2 transition-colors duration-300 ${isList ? 'rounded-xl' : ''}`}></div>
            </div>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onToggleCompare(product);
                }}
                className={`absolute top-3 right-3 p-2 rounded-full shadow-sm backdrop-blur-md transition-all duration-300 z-10 ${isSelected
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-white/90 dark:bg-slate-800/90 text-slate-400 hover:text-indigo-600 hover:scale-110'
                    }`}
                title={isSelected ? "Karşılaştırmadan Çıkar" : "Karşılaştır"}
            >
                {isSelected ? <Check size={18} strokeWidth={2.5} /> : <Plus size={18} strokeWidth={2.5} />}
            </button>

            {onToggleFavorite && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(product);
                    }}
                    className={`absolute top-3 left-3 p-2 rounded-full shadow-sm backdrop-blur-md transition-all duration-300 z-10 ${isFavorite
                        ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-500 scale-110'
                        : 'bg-white/90 dark:bg-slate-800/90 text-slate-400 hover:text-rose-500 hover:scale-110'
                        }`}
                    title={isFavorite ? "Favorilerden Çıkar" : "Favoriye Ekle"}
                >
                    <Heart size={18} strokeWidth={2.5} fill={isFavorite ? "currentColor" : "none"} />
                </button>
            )}

            <div className={`p-3 sm:p-4 flex flex-col justify-between flex-1 min-w-0 ${isList ? 'py-2' : ''}`}>
                <div>
                    <h3 className={`font-bold text-slate-900 dark:text-white leading-tight mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors ${isList ? 'text-sm line-clamp-2' : 'text-sm sm:text-base line-clamp-2 min-h-[2.5rem]'}`}>
                        {product.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 truncate">
                        {product.specs?.slice(0, 2).join(' • ')}
                    </p>
                </div>
                <div className="flex items-center justify-between mt-auto">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-medium">En Ucuz</span>
                        <span className="text-lg sm:text-xl font-bold text-indigo-600 dark:text-indigo-400">
                            {product.price.toLocaleString('tr-TR')} ₺
                        </span>
                    </div>
                    <div className={`flex items-center gap-2 ${isList ? 'mb-1 mr-[-6px]' : ''}`}>
                        <div className={`w-12 h-12 rounded-full bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none group-hover:scale-110 transition-transform`}>
                            <ArrowRight size={20} />
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default ProductCard;
