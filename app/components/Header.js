'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
// import Link from 'next/link';
import { Search, Menu, MessageCircle, Sun, Moon, Home, Tv, Shirt, Armchair, ChevronDown, ArrowRight, Sparkles, X, ChevronRight, User, LogOut, Heart } from 'lucide-react';
import Link from 'next/link';
import { ELECTRONICS_SUBCATEGORIES, PRODUCTS_DATA } from '@/app/data';
import { useAuth } from '@/app/context/AuthContext';

export default function Header({
    activeTab = 'anasayfa',
    onTabChange,
    initialSearchTerm = '',
    onChatOpen,
    categoryImages = {}
}) {
    const router = useRouter();
    const { user, signOut } = useAuth();
    const [theme, setTheme] = useState('light');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Internal Search State
    const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    // Sync if initial changes (e.g. from URL)
    useEffect(() => {
        if (initialSearchTerm) setSearchTerm(initialSearchTerm);
    }, [initialSearchTerm]);

    const [hoveredCategory, setHoveredCategory] = useState(null);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const profileMenuRef = useRef(null);

    // Close profile menu on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setIsProfileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Scroll lock when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMobileMenuOpen]);

    const POPULAR_ELECTRONICS = [
        { id: 'cep-telefonu', label: 'Cep Telefonu', icon: Tv },
        { id: 'televizyon', label: 'Televizyon', icon: Tv },
        { id: 'monitor', label: 'Monitör', icon: Tv },
        { id: 'bluetooth-kulaklik', label: 'Bluetooth Kulaklık', icon: Tv },
        { id: 'bilgisayarlar', label: 'Bilgisayar', icon: Tv },
        { id: 'tablet', label: 'Tablet', icon: Tv },
        { id: 'supurme-yikama', label: 'Süpürge', icon: Tv },
        { id: 'robot-supurge', label: 'Robot Süpürge', icon: Tv },
        { id: 'oyun-kolu', label: 'Oyun Kolu', icon: Tv },
        { id: 'akilli-saat', label: 'Akıllı Saat', icon: Tv },
        { id: 'klima', label: 'Klima', icon: Tv },
        { id: 'kurutma-makinesi', label: 'Kurutma Makinesi', icon: Tv }
    ];

    const CATEGORIES = [
        { id: 'elektronik', label: 'Elektronik', icon: Tv, subItems: POPULAR_ELECTRONICS },
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
        // router.push kaldırıldı, Link ile yönlendirme yapılacak
    };

    return (
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-8">

                {/* 1. LEFT: Logo & Categories */}
                <div className="flex items-center gap-8 shrink-0">
                    {/* Logo */}
                    <Link href="/" className="text-2xl md:text-3xl font-black tracking-tight flex items-center group shrink-0" style={{ fontFamily: 'Inter, sans-serif' }}>
                        <span className="text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">Kıyas</span>
                        <span className="bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-transparent group-hover:rotate-3 transition-transform inline-block">GO</span>
                    </Link>

                    {/* Categories Dropdown (Desktop Mega Menu) */}
                    <div className="relative group hidden md:block" onMouseLeave={() => setHoveredCategory(null)}>
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold transition-all shadow-md shadow-orange-200 dark:shadow-none">
                            <span>Kategoriler</span>
                            <ChevronDown size={18} className="group-hover:rotate-180 transition-transform duration-300" />
                        </button>

                        {/* Mega Menu Container */}
                        <div className="absolute top-full left-0 mt-2 w-[800px] bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left z-50 flex">

                            {/* Left Column: Categories List */}
                            <div className="w-64 bg-slate-50 dark:bg-slate-800/50 py-2 border-r border-slate-100 dark:border-slate-700">
                                {CATEGORIES.map((cat) => (
                                    <Link
                                        key={cat.id}
                                        href={`/${cat.id}`}
                                        onMouseEnter={() => setHoveredCategory(cat.id)}
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
                                    </Link>
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
                                            <div className="grid grid-cols-4 gap-2">
                                                {CATEGORIES.find(c => c.id === hoveredCategory).subItems.filter(sub => !!sub).map((sub) => {
                                                    // Find image from categoryImages prop, or fallback to ELECTRONICS_SUBCATEGORIES children
                                                    let displayImage = categoryImages?.[sub.id] || sub.image;
                                                    if (!displayImage) {
                                                        // Look in ELECTRONICS_SUBCATEGORIES children
                                                        for (const cat of ELECTRONICS_SUBCATEGORIES) {
                                                            const child = cat.children?.find(c => c.id === sub.id);
                                                            if (child?.image) {
                                                                displayImage = child.image;
                                                                break;
                                                            }
                                                        }
                                                    }
                                                    return (
                                                        <Link
                                                            key={sub.id}
                                                            href={`/${sub.id}`}
                                                            className="group/sub flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                                                        >
                                                            <div className="h-12 w-12 bg-white rounded-lg p-1.5 flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-600 group-hover/sub:scale-105 transition-transform">
                                                                {displayImage && displayImage.startsWith('http') ? (
                                                                    <img src={displayImage} alt={sub.label} className="h-full w-full object-contain" />
                                                                ) : (
                                                                    <sub.icon size={20} className="text-slate-400" />
                                                                )}
                                                            </div>
                                                            <span className="text-[11px] font-medium text-center text-slate-600 dark:text-slate-300 group-hover/sub:text-orange-600 dark:group-hover/sub:text-orange-400 leading-tight">
                                                                {sub.label}
                                                            </span>
                                                        </Link>
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
                <div className="flex-1 max-w-3xl hidden md:block relative group z-50">
                    <input
                        type="text"
                        placeholder="Aklındaki ürünü anlat, fırsatları yakala..."
                        className="w-full pl-5 pr-14 py-3.5 bg-slate-100 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-950 border-2 border-transparent focus:border-orange-500 rounded-xl text-base outline-none transition-all shadow-sm focus:shadow-lg text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                router.push(`/arama?q=${encodeURIComponent(searchTerm)}`);
                                setIsSearchOpen(false); // Close suggestions if open
                            }
                        }}
                        onFocus={() => setIsSearchOpen(true)}
                        onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
                    />
                    <button
                        onClick={() => router.push(`/arama?q=${encodeURIComponent(searchTerm)}`)}
                        className="absolute right-3 top-2.5 p-1.5 text-slate-400 group-focus-within:text-orange-500 transition-colors"
                    >
                        <Search size={24} />
                    </button>

                    {/* SUGGESTIONS DROPDOWN */}
                    {isSearchOpen && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-top-2">
                            <SuggestionsList
                                searchTerm={searchTerm}
                                router={router}
                                setIsSearchOpen={setIsSearchOpen}
                            />
                        </div>
                    )}
                </div>

                {/* 3. RIGHT: Actions (Assistant & Theme) */}
                <div className="flex items-center gap-3 shrink-0">
                    {/* Mobilde arama butonu (büyüteç) */}
                    <button
                        type="button"
                        onClick={() => setIsSearchOpen(prev => !prev)}
                        aria-pressed={isSearchOpen}
                        className={`md:hidden flex items-center justify-center w-10 h-10 rounded-full transition-colors mr-1 ${theme === 'dark' ? 'bg-slate-800 text-orange-400 hover:bg-slate-700' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'}`}
                        aria-label="Arama Aç/Kapat"
                    >
                        <Search size={22} />
                    </button>
                    {/* Mobilde Hesabım */}
                    {user ? (
                        <Link
                            href="/profil"
                            className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 hover:shadow-sm transition-shadow"
                            aria-label="Hesabım"
                        >
                            {user.avatar_url ? (
                                <img src={user.avatar_url} alt={user.nickname || "User"} className="w-8 h-8 rounded-full object-cover border border-indigo-200 dark:border-indigo-800" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-bold text-xs">
                                    {user.email?.[0]?.toUpperCase()}
                                </div>
                            )}
                        </Link>
                    ) : (
                        <Link
                            href="/giris-yap"
                            className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 hover:shadow-sm transition-shadow"
                            aria-label="Giriş Yap"
                        >
                            <User size={20} />
                        </Link>
                    )}
                    <button
                        type="button"
                        onClick={() => onChatOpen && onChatOpen(true)}
                        className="hidden lg:flex flex-col items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-2"
                    >
                        <MessageCircle size={24} />
                        <span className="text-[10px] font-bold">Asistan</span>
                    </button>



                    {/* Desktop Auth Button */}
                    <div className="relative hidden lg:block" ref={profileMenuRef}>
                        {user ? (
                            <button
                                type="button"
                                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                className="flex flex-col items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-2"
                            >
                                {user.avatar_url ? (
                                    <img src={user.avatar_url} alt={user.nickname || "User"} className="w-6 h-6 rounded-full object-cover border border-indigo-200 dark:border-indigo-800" />
                                ) : (
                                    <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-bold text-xs">
                                        {user.email?.[0]?.toUpperCase()}
                                    </div>
                                )}
                                <span className="text-[10px] font-bold">Hesabım</span>
                            </button>
                        ) : (
                            <Link
                                href="/giris-yap"
                                className="flex flex-col items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-2"
                            >
                                <User size={24} />
                                <span className="text-[10px] font-bold">Giriş</span>
                            </Link>
                        )}
                        {/* Profile Dropdown (only if user and open) */}
                        {isProfileMenuOpen && user && (
                            <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.nickname || user.full_name || 'Kullanıcı'}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                                </div>
                                <div className="p-2">
                                    <Link href="/profil" className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors font-medium">
                                        <User size={18} />
                                        <span>Profilim</span>
                                    </Link>
                                    <Link href="/favoriler" className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors font-medium">
                                        <Heart size={18} />
                                        <span>Favorilerim</span>
                                    </Link>
                                    <button
                                        onClick={() => { signOut(); setIsProfileMenuOpen(false); }}
                                        className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors font-medium"
                                    >
                                        <LogOut size={18} />
                                        <span>Çıkış Yap</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Desktop Theme Button (Rightmost) */}
                    <button
                        onClick={toggleTheme}
                        className="hidden md:flex flex-col items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-orange-500 transition-colors p-2"
                    >
                        {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
                        <span className="text-[10px] font-bold">Mod</span>
                    </button>
                    {/* Menü tuşu sadece mobilde gözükür */}
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                    >
                        <Menu size={22} />
                    </button>
                </div>
            </div>

            {/* Mobile Search Bar (Below Header) */}
            {isSearchOpen && (
                <div className="md:hidden px-4 pb-4 animate-in slide-in-from-top-2 duration-200">
                    <div className="relative w-full">
                        <input
                            type="text"
                            placeholder="Aklındaki ürünü anlat..."
                            className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    router.push(`/arama?q=${encodeURIComponent(searchTerm)}`);
                                    setIsSearchOpen(false);
                                }
                            }}
                            autoFocus
                        />
                        <button
                            onClick={() => router.push(`/arama?q=${encodeURIComponent(searchTerm)}`)}
                            className="absolute left-3 top-3 text-slate-400"
                        >
                            <Search size={18} />
                        </button>

                        {/* Mobile Suggestions Dropdown */}
                        {/* Always show if open and there is focus conceptually, though here we rely on isSearchOpen parent logic which is already true */}
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden z-50">
                            <SuggestionsList
                                searchTerm={searchTerm}
                                router={router}
                                setIsSearchOpen={setIsSearchOpen}
                            />
                        </div>
                    </div>
                </div>
            )}

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
                                    <div key={cat.id} className="border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                                        <button
                                            onClick={() => handleCategoryClick(cat.id)}
                                            className="flex items-center justify-between w-full p-4 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl transition-colors text-left"
                                        >
                                            <span className="text-lg font-bold text-slate-800 dark:text-slate-100">{cat.label}</span>
                                            <ChevronRight size={20} className="text-slate-300" />
                                        </button>
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

                            {/* Mobile Auth Buttons */}
                            {user ? (
                                <Link href="/profil" onClick={() => setIsMobileMenuOpen(false)} className="col-span-2 flex items-center justify-center gap-2 p-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none">
                                    <User size={20} />
                                    <span>Hesabım</span>
                                </Link>
                            ) : (
                                <Link href="/giris-yap" className="col-span-2 flex items-center justify-center gap-2 p-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none">
                                    <User size={20} />
                                    <span>Giriş Yap / Kayıt Ol</span>
                                </Link>
                            )}

                            <Link
                                href="/bize-ulasin"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="col-span-2 flex items-center justify-center gap-2 p-3 bg-white/5 dark:bg-white/5 rounded-xl font-bold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900/60 transition-colors"
                            >
                                <ChevronRight size={18} />
                                <span>Bize Ulaşın</span>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </header >
    );
}

// Helper Component for highlighting search terms
const HighlightText = ({ text, highlight }) => {
    if (!highlight) return <>{text}</>;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
        <>
            {parts.map((part, i) =>
                part.toLowerCase() === highlight.toLowerCase()
                    ? <strong key={i} className="text-slate-900 dark:text-white">{part}</strong>
                    : part
            )}
        </>
    );
};

// Internal Suggestions Component to handle Async Logic
function SuggestionsList({ searchTerm, router, setIsSearchOpen }) {
    const [matches, setMatches] = useState([]);
    const [categoryMatches, setCategoryMatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const { supabase } = useAuth();

    // Favorites / Popular Products (display when no search)
    const favoriteProducts = React.useMemo(() => {
        // Return first 5 high rated or popular products from static data
        return PRODUCTS_DATA.filter(p => p.rating >= 4.5).slice(0, 5);
    }, []);

    // Build category list from ELECTRONICS_SUBCATEGORIES
    const allCategories = React.useMemo(() => {
        const cats = [];
        ELECTRONICS_SUBCATEGORIES.forEach(cat => {
            cats.push({ id: cat.id, label: cat.label, type: 'parent' });
            if (cat.children) {
                cat.children.forEach(child => {
                    cats.push({ id: child.id, label: child.label, type: 'child', parentId: cat.id });
                });
            }
        });
        return cats;
    }, []);

    useEffect(() => {
        if (!searchTerm || searchTerm.length < 2) {
            setMatches([]);
            setCategoryMatches([]);
            return;
        }

        const lowerSearch = searchTerm.toLowerCase();

        // 1. Find matching categories
        const matchedCats = allCategories.filter(cat =>
            cat.label.toLowerCase().includes(lowerSearch) ||
            cat.id.toLowerCase().includes(lowerSearch.replace(/ /g, '-'))
        ).slice(0, 4);
        setCategoryMatches(matchedCats);

        // 2. Check for exact category match -> direct redirect
        const exactMatch = allCategories.find(cat =>
            cat.label.toLowerCase() === lowerSearch ||
            cat.id.toLowerCase() === lowerSearch.replace(/ /g, '-')
        );
        if (exactMatch) {
            // Don't auto-redirect on typing, but mark for easy click
        }

        // 3. Fetch products from Supabase (only if supabase is available)
        const fetchSuggestions = async () => {
            // Guard: If supabase is not initialized, skip product search
            if (!supabase) {
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('id, name, slug, category, subcategory, image')
                    .ilike('name', `%${searchTerm}%`)
                    .limit(5);

                if (error) {
                    console.error("Supabase error:", error);
                } else if (data) {
                    setMatches(data);
                }
            } catch (e) {
                console.error("Suggestion error", e);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, supabase, allCategories]);

    const handleCategoryClick = (cat) => {
        setIsSearchOpen(false);
        router.push(`/${cat.id}`);
    };

    const handleProductClick = (product) => {
        setIsSearchOpen(false);
        // Navigate to product detail or search
        const slug = product.slug || product.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-ğüşıöçĞÜŞİÖÇ]/gi, '');
        router.push(`/${product.subcategory || 'elektronik'}/en-ucuz-${slug}-fiyati`);
    };

    const showFavorites = !searchTerm || searchTerm.length < 2;

    return (
        <div className="flex flex-col max-h-[70vh] overflow-y-auto">
            {loading && (
                <div className="px-4 py-3 text-sm text-slate-400 flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-slate-300 border-t-indigo-500 rounded-full animate-spin"></div>
                    Aranıyor...
                </div>
            )}

            {/* FAVORITE PRODUCTS SECTION (When search is empty) */}
            {showFavorites && (
                <div>
                    <div className="px-4 py-2 text-xs font-bold text-indigo-500 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/30 flex items-center gap-2">
                        <Sparkles size={12} /> Favori Ürünler
                    </div>
                    {favoriteProducts.map(product => (
                        <button
                            key={product.id}
                            onMouseDown={() => handleProductClick(product)}
                            className="px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 flex items-center gap-3 w-full transition-colors group/item"
                        >
                            <div className="w-8 h-8 rounded bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                                {product.image && product.image.startsWith('http') ? (
                                    <img src={product.image} alt="" className="w-full h-full object-contain" />
                                ) : (
                                    <Search size={12} className="text-slate-300" />
                                )}
                            </div>
                            <span className="truncate flex-1 font-medium">
                                {product.name}
                            </span>
                            <span className="text-xs text-green-600 dark:text-green-400 font-bold bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded">
                                Fırsat
                            </span>
                        </button>
                    ))}
                </div>
            )}


            {/* CATEGORIES SECTION */}
            {!loading && !showFavorites && categoryMatches.length > 0 && (
                <div className="border-b border-slate-100 dark:border-slate-800">
                    <div className="px-4 py-2 text-xs font-bold text-rose-500 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/30">
                        Kategoriler
                    </div>
                    {categoryMatches.map(cat => (
                        <button
                            key={cat.id}
                            onMouseDown={() => handleCategoryClick(cat)}
                            className="px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center gap-3 w-full transition-colors group/cat"
                        >
                            <span className="w-6 h-6 rounded bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                                <ChevronRight size={14} className="text-rose-500" />
                            </span>
                            <span className="flex-1">
                                <HighlightText text={cat.label} highlight={searchTerm} />
                            </span>
                            <ArrowRight size={14} className="opacity-0 group-hover/cat:opacity-50 transition-opacity text-rose-500" />
                        </button>
                    ))}
                </div>
            )}

            {/* PRODUCTS SECTION */}
            {!loading && !showFavorites && matches.length > 0 && (
                <div className="border-b border-slate-100 dark:border-slate-800">
                    <div className="px-4 py-2 text-xs font-bold text-indigo-500 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/30">
                        Ürünler
                    </div>
                    {matches.map(product => (
                        <button
                            key={product.id}
                            onMouseDown={() => handleProductClick(product)}
                            className="px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 flex items-center gap-3 w-full transition-colors group/item"
                        >
                            {/* Product Image */}
                            <div className="w-8 h-8 rounded bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                                {product.image && product.image.startsWith('http') ? (
                                    <img src={product.image} alt="" className="w-full h-full object-contain" />
                                ) : (
                                    <Search size={12} className="text-slate-300" />
                                )}
                            </div>
                            <span className="truncate flex-1">
                                <HighlightText text={product.name} highlight={searchTerm} />
                            </span>
                            <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                                {product.subcategory?.replace(/-/g, ' ') || 'Ürün'}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {/* NO RESULTS */}
            {!loading && !showFavorites && matches.length === 0 && categoryMatches.length === 0 && (
                <div className="px-4 py-3 text-sm text-slate-400 italic">Sonuç bulunamadı...</div>
            )}

            {/* VIEW ALL BUTTON */}
            {!showFavorites && (
                <button
                    onMouseDown={() => router.push(`/arama?q=${encodeURIComponent(searchTerm)}`)}
                    className="px-4 py-3 text-left text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/10 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 flex items-center gap-2 transition-colors"
                >
                    <span className="bg-indigo-100 dark:bg-indigo-900/50 p-1 rounded text-indigo-600 dark:text-indigo-300"><Search size={14} /></span>
                    "{searchTerm}" için tüm sonuçları gör
                </button>
            )}
        </div>
    );
}
