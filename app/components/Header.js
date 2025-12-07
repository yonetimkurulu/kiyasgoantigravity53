'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Menu, MessageCircle, Sun, Moon, Home, Tv, Shirt, Armchair, ChevronDown, ArrowRight, Sparkles } from 'lucide-react';

export default function Header({
    activeTab = 'anasayfa',
    onTabChange,
    searchTerm = '',
    onSearchChange,
    onChatOpen
}) {
    const router = useRouter();
    const [theme, setTheme] = useState('light');

    const CATEGORIES = [
        { id: 'elektronik', label: 'Elektronik', icon: Tv },
        { id: 'ev-yasam', label: 'Ev, Ofis, Yaşam', icon: Armchair },
        { id: 'moda', label: 'Moda, Giyim', icon: Shirt },
        { id: 'anne-bebek', label: 'Anne, Bebek, Oyuncak', icon: Home },
        { id: 'kozmetik', label: 'Kozmetik, Bakım', icon: Sparkles }, // Using Sparkles as placeholder
        { id: 'supermarket', label: 'Süpermarket', icon: Home },
        { id: 'spor', label: 'Spor, Outdoor', icon: Home },
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

                    {/* Categories Dropdown (Desktop) */}
                    <div className="relative group hidden md:block">
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold transition-all shadow-md shadow-orange-200 dark:shadow-none">
                            <span>Kategoriler</span>
                            <ChevronDown size={18} className="group-hover:rotate-180 transition-transform duration-300" />
                        </button>

                        {/* Dropdown Menu */}
                        <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left z-50">
                            <div className="py-2">
                                {CATEGORIES.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => handleCategoryClick(cat.id)}
                                        className="w-full text-left px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-3 text-slate-700 dark:text-slate-200 transition-colors group/item"
                                    >
                                        <cat.icon size={18} className="text-slate-400 group-hover/item:text-orange-500 transition-colors" />
                                        <span className="font-medium">{cat.label}</span>
                                        <ArrowRight size={14} className="ml-auto opacity-0 group-hover/item:opacity-100 -translate-x-2 group-hover/item:translate-x-0 transition-all text-slate-400" />
                                    </button>
                                ))}
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
                        <button className="p-2 text-slate-600 dark:text-slate-300"><Menu size={24} /></button>
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
        </header>
    );
}
