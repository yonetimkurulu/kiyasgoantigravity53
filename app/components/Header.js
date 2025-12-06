'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Menu, MessageCircle, Sun, Moon, Home, Tv, Shirt, Armchair } from 'lucide-react';

export default function Header({
    activeTab = 'anasayfa',
    onTabChange,
    searchTerm = '',
    onSearchChange,
    onChatOpen
}) {
    const router = useRouter();
    const [theme, setTheme] = useState('light');

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

    const handleNavigation = (id) => {
        if (onTabChange) {
            onTabChange(id);
        } else {
            // Default navigation if no handler provided (e.g. from comparison page)
            if (id === 'anasayfa') router.push('/');
            else router.push(`/${id}`);
        }
    };

    const NavButton = ({ id, label, icon: Icon }) => (
        <button
            onClick={() => handleNavigation(id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-300 whitespace-nowrap font-medium text-sm ${activeTab === id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none scale-105'
                : 'text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
        >
            <Icon size={18} />
            <span className="md:inline">{label}</span>
        </button>
    );

    return (
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex justify-between items-center w-full md:w-auto">
                        <div className="flex items-center gap-8">
                            <a href="/" className="text-2xl font-black tracking-tight flex items-center gap-1 group">
                                <span className="text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">Kıyas</span>
                                <span className="bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-transparent group-hover:rotate-3 transition-transform inline-block">GO</span>
                            </a>
                            <nav className="hidden md:flex gap-1 bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-full border border-slate-200/50 dark:border-slate-700/50">
                                <NavButton id="anasayfa" label="Vitrin" icon={Home} />
                                <NavButton id="elektronik" label="Elektronik" icon={Tv} />
                                <NavButton id="moda" label="Moda" icon={Shirt} />
                                <NavButton id="ev-yasam" label="Ev & Yaşam" icon={Armchair} />
                            </nav>
                        </div>
                        <div className="flex items-center gap-2 md:hidden">
                            <button onClick={() => onChatOpen && onChatOpen(true)} className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-full transition-colors">
                                <MessageCircle size={24} />
                            </button>
                            <button onClick={toggleTheme} className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                            </button>
                            <button className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"><Menu size={24} /></button>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative w-full md:max-w-xs group flex-1">
                            <input
                                type="text"
                                placeholder="Ürün, marka veya kategori ara..."
                                className="w-full pl-11 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 border border-transparent focus:border-indigo-500 dark:focus:border-indigo-400 rounded-full text-sm outline-none transition-all shadow-sm focus:shadow-md text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                value={searchTerm}
                                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                            />
                            <Search className="absolute left-4 top-2.5 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors" size={18} />
                        </div>

                        <button
                            onClick={() => onChatOpen && onChatOpen(true)}
                            className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-medium text-sm transition-all shadow-md hover:shadow-lg"
                        >
                            <MessageCircle size={18} />
                            <span>Asistan</span>
                        </button>

                        <button
                            onClick={toggleTheme}
                            className="hidden md:flex p-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-full transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                            title={theme === 'light' ? "Karanlık Mod" : "Aydınlık Mod"}
                        >
                            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        </button>
                    </div>
                </div>
                {/* Mobile Nav */}
                <div className="flex md:hidden gap-2 mt-4 overflow-x-auto pb-2 no-scrollbar">
                    <NavButton id="anasayfa" label="Tümü" icon={Home} />
                    <NavButton id="elektronik" label="Elektro" icon={Tv} />
                    <NavButton id="moda" label="Moda" icon={Shirt} />
                    <NavButton id="ev-yasam" label="Ev" icon={Armchair} />
                </div>
            </div>
        </header>
    );
}
