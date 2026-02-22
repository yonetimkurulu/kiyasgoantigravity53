'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Menu, Home, Shirt, Tv, Armchair } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState("");

  // Hangi menüde olduğumuzu anlamak için
  const isActive = (path) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  const NavButton = ({ path, label, icon: Icon }) => (
    <Link
      href={path}
      className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all whitespace-nowrap ${
        isActive(path) ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <Icon size={18} />
      <span className="md:inline font-medium">{label}</span>
    </Link>
  );

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex justify-between items-center w-full md:w-auto">
            <div className="flex items-center gap-8">
              <Link href="/" className="text-2xl font-black text-blue-600 tracking-tight flex items-center gap-1 cursor-pointer">
                Kıyas<span className="text-red-600">GO</span>
              </Link>
              <nav className="hidden md:flex gap-2">
                <NavButton path="/" label="Vitrin" icon={Home} />
                <NavButton path="/elektronik" label="Elektronik" icon={Tv} />
                <NavButton path="/moda" label="Moda" icon={Shirt} />
                <NavButton path="/ev-yasam" label="Ev & Yaşam" icon={Armchair} />
              </nav>
            </div>
            <button className="md:hidden text-gray-600"><Menu size={24} /></button>
          </div>
          <div className="relative w-full md:max-w-xs">
            <input
              type="text"
              placeholder="Ara..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 focus:bg-white border border-transparent focus:border-blue-500 rounded-full text-sm outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3.5 top-2 text-gray-400" size={18} />
          </div>
        </div>
        {/* Mobil Menü */}
        <div className="flex md:hidden gap-2 mt-3 overflow-x-auto pb-2 no-scrollbar">
            <NavButton path="/" label="Tümü" icon={Home} />
            <NavButton path="/elektronik" label="Elektro" icon={Tv} />
            <NavButton path="/moda" label="Moda" icon={Shirt} />
            <NavButton path="/ev-yasam" label="Ev" icon={Armchair} />
        </div>
      </div>
    </header>
  );
}