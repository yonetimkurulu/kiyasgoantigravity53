'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Menu, MessageCircle, Sun, Moon, Home, Tv, Shirt, Armchair, ChevronDown, ArrowRight, Sparkles, X, ChevronRight } from 'lucide-react';
import { ELECTRONICS_SUBCATEGORIES } from '@/app/data';

export default function Header({
    activeTab = 'anasayfa',
    onTabChange,
    searchTerm = '',
    onSearchChange,
    onChatOpen,
    categoryImages = {}
}) {
    const router = useRouter();
    const [theme, setTheme] = useState('light');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [hoveredCategory, setHoveredCategory] = useState(null);

    const CATEGORIES = [
        { id: 'elektronik', label: 'Elektronik', icon: Tv, subItems: ELECTRONICS_SUBCATEGORIES },
        { id: 'ev-yasam', label: 'Ev, Ofis, Yaşam', icon: Armchair, subItems: [] },
        { id: 'moda', label: 'Moda, Giyim', icon: Shirt, subItems: [] },
        { id: 'anne-bebek', label: 'Anne, Bebek, Oyuncak', icon: Home, subItems: [] },
        { id: 'kozmetik', label: 'Kozmetik, Bakım', icon: Sparkles, subItems: [] },
        { id: 'supermarket', label: 'Süpermarket', icon: Home, subItems: [] },
        { id: 'spor', label: 'Spor, Outdoor', icon: Home, subItems: [] },
    ];

    useEffect(() => {
        // 1. Check LocalStorage
        const savedTheme = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;

        if (savedTheme) {
            setTheme(savedTheme);
            if (savedTheme === 'dark') document.documentElement.classList.add('dark');
            else document.documentElement.classList.remove('dark');
        } else {
            // 2. Fallback to System Preference
            if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                setTheme('dark');
                document.documentElement.classList.add('dark');
            }
        }
    }, []);

    const toggleTheme = () => {
        if (theme === 'light') {
            setTheme('dark');
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            setTheme('light');
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    const handleCategoryClick = (id) => {
        setIsMobileMenuOpen(false);
        if (onTabChange) onTabChange(id);
        else router.push(`/${id}`);
    };

    return (
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-8">

                {/* 1. LEFT: Logo & Categories */}
                <div className="flex items-center gap-8 shrink-0">
                    {/* Logo */}
                    <a href="/" className="text-3xl font-black tracking-tight flex items-center gap-1 group shrink-0">
                        <span className="text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">Kıyas</span>
                        <span className="bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-transparent group-hover:rotate-3 transition-transform inline-block">GO</span>
                    </a>

                    {/* Categories Dropdown (Desktop Mega Menu) */}
                    <div className="relative group hidden md:block" onMouseLeave={() => setHoveredCategory(null)}>
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold transition-all shadow-md shadow-orange-200 dark:shadow-none">
                            <span>Kategoriler</span>
                            <ChevronDown size={18} className="group-hover:rotate-180 transition-transform duration-300" />
                        </button>

                        {/* Mega Menu Container */}
                        <div className="absolute top-full left-0 mt-2 w-[800px] bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left z-50 flex">

                            {/* Left Column: Categories List */}
                            <div className="w-64 bg-slate-50 dark:bg-slate-800/50 py-2 border-r border-slate-100 dark:border-slate-700">
                                {CATEGORIES.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onMouseEnter={() => setHoveredCategory(cat.id)}
                                        onClick={() => handleCategoryClick(cat.id)}
                                        className={`w-full text-left px-5 py-3 flex items-center gap-3 transition-colors ${hoveredCategory === cat.id
                                            ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 font-bold shadow-sm'
                                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                                            }`}
                                    >
                                        <cat.icon size={18} className={hoveredCategory === cat.id ? 'text-orange-500' : 'text-slate-400'} />
                                        <span className="truncate">{cat.label}</span>
                                        {cat.subItems && cat.subItems.length > 0 && (
                                            <ChevronRight size={14} className="ml-auto opacity-50" />
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Right Column: Subcategories (Mega Content) */}
                            <div className="flex-1 p-6 bg-white dark:bg-slate-800 min-h-[400px]">
                                {hoveredCategory ? (
                                    <div className="animate-in fade-in slide-in-from-left-2 duration-200">
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                                            {CATEGORIES.find(c => c.id === hoveredCategory)?.label}
                                            <span className="text-slate-400 text-sm font-normal">Kategorisi</span>
                                        </h3>

                                        {/* Dynamic Grid for Subitems */}
                                        {CATEGORIES.find(c => c.id === hoveredCategory)?.subItems?.length > 0 ? (
                                            <div className="grid grid-cols-3 gap-4">
                                                {CATEGORIES.find(c => c.id === hoveredCategory).subItems.map((sub) => {
                                                    const displayImage = categoryImages[sub.id] || sub.image;
                                                    return (
                                                        <a
                                                            key={sub.id}
                                                            href={`/elektronik/${sub.id}`} // Simple routing for now
                                                            className="group/sub flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
                                                        >
                                                            <div className="h-16 w-16 bg-white dark:bg-slate-700 rounded-lg p-2 flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-600 group-hover/sub:scale-110 transition-transform">
                                                                {displayImage && displayImage.startsWith('http') ? (
                                                                    <img src={displayImage} alt={sub.label} className="h-full w-full object-contain" />
                                                                ) : (
                                                                    <span className="text-2xl">{sub.icon}</span>
                                                                )}
                                                            </div>
                                                            <span className="text-xs font-medium text-center text-slate-600 dark:text-slate-300 group-hover/sub:text-orange-600 dark:group-hover/sub:text-orange-400">
                                                                {sub.label}
                                                            </span>
                                                        </a>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                                                <Sparkles size={48} className="mb-4 opacity-20" />
                                                <p>Bu kategori için alt başlıklar yakında eklenecek.</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                                        Detayları görmek için bir kategori seçin.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. CENTER: Search Bar (Expanded) */}
                <div className="flex-1 max-w-3xl hidden md:block relative group">
                    <input
                        type="text"
                        placeholder="Neyi ucuza almak istersin?"
                        className="w-full pl-5 pr-14 py-3.5 bg-slate-100 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-950 border-2 border-transparent focus:border-orange-500 rounded-xl text-base outline-none transition-all shadow-sm focus:shadow-lg text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-500"
                        value={searchTerm}
                        onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                    />
                    <button className="absolute right-3 top-2.5 p-1.5 text-slate-400 group-focus-within:text-orange-500 transition-colors">
                        <Search size={24} />
                    </button>
                </div>

                {/* 3. RIGHT: Actions (Assistant & Theme) */}
                <div className="flex items-center gap-3 shrink-0">
                    <button
                        onClick={() => onChatOpen && onChatOpen(true)}
                        className="hidden lg:flex flex-col items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-2"
                    >
                        <MessageCircle size={24} />
                        <span className="text-[10px] font-bold">Asistan</span>
                    </button>

                    <button
                        onClick={toggleTheme}
                        className="hidden md:flex flex-col items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-orange-500 transition-colors p-2"
                    >
                        {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
                        <span className="text-[10px] font-bold">Mod</span>
                    </button>

                    {/* Mobile Menu Toggle (Visible only on mobile) */}
                    <div className="flex md:hidden gap-2">
                        <button className="p-2 text-slate-600 dark:text-slate-300"><Search size={24} /></button>
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                        >
                            <Menu size={24} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Search Bar (Below Header) */}
            <div className="md:hidden px-4 pb-4">
                <div className="relative w-full">
                    <input
                        type="text"
                        placeholder="Ara..."
                        className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm outline-none"
                        value={searchTerm}
                        onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                    />
                    <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                </div>
            </div>

            {/* MOBILE MENU OVERLAY */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 bg-white dark:bg-slate-950 md:hidden animate-in slide-in-from-right duration-300">
                    <div className="flex flex-col h-full">
                        {/* Header of Overlay */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-xl font-bold text-slate-900 dark:text-white">Kategoriler</span>
                            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-4">
                            <div className="grid gap-2">
                                {CATEGORIES.map((cat) => (
                                    <div key={cat.id} className="border-b border-slate-50 dark:border-slate-800/50 last:border-0 pb-2 mb-2">
                                        <button
                                            onClick={() => handleCategoryClick(cat.id)}
                                            className="flex items-center gap-4 w-full p-4 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl transition-colors text-left group"
                                        >
                                            <div className="bg-orange-100 dark:bg-orange-900/20 p-3 rounded-xl text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform">
                                                <cat.icon size={24} />
                                            </div>
                                            <div className="flex-1">
                                                <span className="text-lg font-bold text-slate-800 dark:text-slate-100 block">{cat.label}</span>
                                                <span className="text-sm text-slate-400">{cat.subItems?.length || 0} Alt Kategori</span>
                                            </div>
                                            <ChevronRight size={20} className="text-slate-300" />
                                        </button>

                                        {/* Show top subitems directly in mobile menu for easy access */}
                                        {cat.subItems?.length > 0 && (
                                            <div className="pl-20 pr-4 grid grid-cols-3 gap-2 mt-2">
                                                {cat.subItems.slice(0, 3).map(sub => ( // Show first 3 only to save space
                                                    <a key={sub.id} href={`/elektronik/${sub.id}`} className="text-xs text-center p-2 bg-slate-50 dark:bg-slate-900 rounded-lg text-slate-600 dark:text-slate-400 truncate">
                                                        {sub.label}
                                                    </a>
                                                ))}
                                                {cat.subItems.length > 3 && (
                                                    <span className="text-xs text-center p-2 text-slate-400">+{(cat.subItems.length - 3)}</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4">
                            <button onClick={toggleTheme} className="flex items-center justify-center gap-2 p-3 bg-slate-100 dark:bg-slate-900 rounded-xl font-bold text-slate-700 dark:text-slate-200">
                                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                                <span>{theme === 'light' ? 'Koyu Mod' : 'Aydınlık Mod'}</span>
                            </button>
                            <button onClick={() => { setIsMobileMenuOpen(false); onChatOpen && onChatOpen(true); }} className="flex items-center justify-center gap-2 p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl font-bold text-indigo-700 dark:text-indigo-300">
                                <MessageCircle size={20} />
                                <span>Asistan</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
