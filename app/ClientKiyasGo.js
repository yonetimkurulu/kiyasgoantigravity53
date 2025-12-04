'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Menu, Zap, X, ChevronRight, Home, Shirt, Tv, Armchair, ArrowRight, ExternalLink, Star, ShoppingBag, TrendingUp, Sun, Moon, MessageCircle } from 'lucide-react';

const generatePrices = (basePrice) => [
  { store: "Trendyol", price: basePrice, color: "text-orange-600 dark:text-orange-400" },
  { store: "Hepsiburada", price: basePrice - 500, color: "text-orange-500 dark:text-orange-300" },
  { store: "Amazon", price: basePrice + 250, color: "text-yellow-600 dark:text-yellow-400" },
  { store: "N11", price: basePrice + 100, color: "text-purple-600 dark:text-purple-400" },
  { store: "MediaMarkt", price: basePrice + 1000, color: "text-red-600 dark:text-red-400" },
];

const ELECTRONICS_SUBCATEGORIES = [
  { id: "cep-telefonu", label: "Cep Telefonu", icon: "📱" },
  { id: "televizyon", label: "Televizyon", icon: "📺" },
  { id: "monitor", label: "Monitör", icon: "🖥️" },
  { id: "bluetooth-kulaklik", label: "Bluetooth Kulaklık", icon: "🎧" },
  { id: "ekran-karti", label: "Ekran Kartı", icon: "🎮" },
  { id: "dikey-supurge", label: "Dikey Süpürge", icon: "🧹" },
  { id: "tablet", label: "Tablet", icon: "📟" },
  { id: "laptop", label: "Laptop ve Notebook", icon: "💻" },
  { id: "oyun-bilgisayari", label: "Oyun Bilgisayarı", icon: "🕹️" },
  { id: "robot-supurge", label: "Robot Süpürge", icon: "🤖" },
  { id: "akilli-saat", label: "Akıllı Saat", icon: "⌚" },
  { id: "kurutma-makinesi", label: "Kurutma Makinesi", icon: "🧺" },
];

const PRODUCTS_DATA = [
  // Mevcut Ürünler (Güncellendi)
  { id: "iphone-15-pro", name: "iPhone 15 Pro", category: "elektronik", subcategory: "cep-telefonu", price: 75000, image: "📱", desc: "Titanyum tasarım, A17 Pro çip.", rating: 4.8, prices: generatePrices(75000) },
  { id: "samsung-s24-ultra", name: "Samsung S24 Ultra", category: "elektronik", subcategory: "cep-telefonu", price: 72000, image: "📱", desc: "Galaxy AI özellikleri, 200MP kamera.", rating: 4.7, prices: generatePrices(72000) },
  { id: "dyson-v15", name: "Dyson V15", category: "ev-yasam", subcategory: "dikey-supurge", price: 25000, image: "🧹", desc: "Lazer teknolojili kablosuz süpürge.", rating: 4.9, prices: generatePrices(25000) },
  { id: "nike-air-max", name: "Nike Air Max", category: "moda", price: 4500, image: "👟", desc: "Günlük kullanım için ikonik tasarım.", rating: 4.5, prices: generatePrices(4500) },
  { id: "sony-wh-1000xm5", name: "Sony WH-1000XM5", category: "elektronik", subcategory: "bluetooth-kulaklik", price: 12000, image: "🎧", desc: "Endüstri lideri gürültü engelleme.", rating: 4.6, prices: generatePrices(12000) },
  { id: "zara-blazer", name: "Zara Blazer Ceket", category: "moda", price: 3200, image: "🧥", desc: "Ofis şıklığı için modern kesim.", rating: 4.3, prices: generatePrices(3200) },
  { id: "philips-airfryer", name: "Philips Airfryer XXL", category: "ev-yasam", price: 8500, image: "🍟", desc: "Az yağ ile çıtır lezzetler.", rating: 4.8, prices: generatePrices(8500) },
  { id: "macbook-air-m2", name: "MacBook Air M2", category: "elektronik", subcategory: "laptop", price: 42000, image: "💻", desc: "İnce, hafif ve güçlü M2 işlemci.", rating: 4.9, prices: generatePrices(42000) },

  // Yeni Cep Telefonları (10+ Adet)
  { id: "iphone-14", name: "iPhone 14", category: "elektronik", subcategory: "cep-telefonu", price: 58000, image: "📱", desc: "A15 Bionic çip, çift kamera sistemi.", rating: 4.6, prices: generatePrices(58000) },
  { id: "iphone-13", name: "iPhone 13", category: "elektronik", subcategory: "cep-telefonu", price: 42000, image: "📱", desc: "Sinematik mod, dayanıklı tasarım.", rating: 4.5, prices: generatePrices(42000) },
  { id: "samsung-s23-fe", name: "Samsung Galaxy S23 FE", category: "elektronik", subcategory: "cep-telefonu", price: 24000, image: "📱", desc: "İkonik tasarım, güçlü performans.", rating: 4.4, prices: generatePrices(24000) },
  { id: "xiaomi-13t-pro", name: "Xiaomi 13T Pro", category: "elektronik", subcategory: "cep-telefonu", price: 33000, image: "📱", desc: "Leica kamera, 144Hz ekran.", rating: 4.7, prices: generatePrices(33000) },
  { id: "redmi-note-13-pro", name: "Redmi Note 13 Pro", category: "elektronik", subcategory: "cep-telefonu", price: 16500, image: "📱", desc: "200MP kamera, 67W hızlı şarj.", rating: 4.3, prices: generatePrices(16500) },
  { id: "huawei-p60-pro", name: "Huawei P60 Pro", category: "elektronik", subcategory: "cep-telefonu", price: 39000, image: "📱", desc: "Ultra aydınlatmalı XMAGE kamera.", rating: 4.8, prices: generatePrices(39000) },
  { id: "honor-90", name: "Honor 90", category: "elektronik", subcategory: "cep-telefonu", price: 18000, image: "📱", desc: "200MP ultra net kamera, göz dostu ekran.", rating: 4.5, prices: generatePrices(18000) },
  { id: "nothing-phone-2", name: "Nothing Phone (2)", category: "elektronik", subcategory: "cep-telefonu", price: 29000, image: "📱", desc: "Glyph arayüzü, şeffaf tasarım.", rating: 4.6, prices: generatePrices(29000) },
  { id: "realme-11-pro", name: "Realme 11 Pro+", category: "elektronik", subcategory: "cep-telefonu", price: 19500, image: "📱", desc: "Lüks vegan deri tasarım, 200MP kamera.", rating: 4.4, prices: generatePrices(19500) },
  { id: "poco-f5", name: "POCO F5", category: "elektronik", subcategory: "cep-telefonu", price: 21000, image: "📱", desc: "Snapdragon 7+ Gen 2, amiral gemisi performansı.", rating: 4.7, prices: generatePrices(21000) },
  { id: "samsung-a54", name: "Samsung Galaxy A54", category: "elektronik", subcategory: "cep-telefonu", price: 15000, image: "📱", desc: "Geceografi, uzun pil ömrü.", rating: 4.3, prices: generatePrices(15000) },
  { id: "iphone-11", name: "iPhone 11", category: "elektronik", subcategory: "cep-telefonu", price: 23000, image: "📱", desc: "Hala güçlü, hala renkli.", rating: 4.2, prices: generatePrices(23000) },
];

export default function ClientKiyasGo({ initialCategory = 'anasayfa' }) {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState(initialCategory);
  const [activeSubcategory, setActiveSubcategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Merhaba! Ben KıyasGO Asistan. Fiyatlar ve özellikler hakkında bana soru sorabilirsin.' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [theme, setTheme] = useState('light');

  const chatEndRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }
  };

  const handleTabChange = (category) => {
    setActiveTab(category);
    setActiveSubcategory(null); // Kategori değişince alt kategoriyi sıfırla
    if (category === 'anasayfa') {
      router.push('/');
    } else {
      router.push(`/${category}`);
    }
  };

  const handleProductClick = (product) => {
    router.push(`/${product.category}/${product.id}`);
  };

  const filteredProducts = PRODUCTS_DATA.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeTab === 'anasayfa' ? true : product.category === activeTab;
    const matchesSubcategory = activeSubcategory ? product.subcategory === activeSubcategory : true;

    // Elektronik kategorisinde alt kategori seçilmemişse ürün gösterme
    if (activeTab === 'elektronik' && !activeSubcategory && !searchTerm) {
      return false;
    }

    return matchesSearch && matchesCategory && matchesSubcategory;
  });

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const form = e.target;
    const input = form.elements.msgInput;
    const text = input.value.trim();
    if (!text) return;

    setMessages(prev => [...prev, { role: 'user', text }]);
    input.value = '';
    setIsTyping(true);

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text })
      });
      const data = await response.json();
      const aiResponse = data.result || "Bir hata oluştu.";
      setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "Şu an sunucuya bağlanamıyorum." }]);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const NavButton = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => handleTabChange(id)}
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 flex flex-col relative selection:bg-indigo-100 selection:text-indigo-700 dark:selection:bg-indigo-900 dark:selection:text-indigo-100 transition-colors duration-300">
      {/* Header */}
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
                <button onClick={() => setChatOpen(true)} className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-full transition-colors">
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
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-4 top-2.5 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors" size={18} />
              </div>

              <button
                onClick={() => setChatOpen(true)}
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

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full pb-32">
        {/* Hero Section */}
        {activeTab === 'anasayfa' && !searchTerm && (
          <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-rose-500 dark:from-indigo-900 dark:via-purple-900 dark:to-rose-900 rounded-3xl p-8 md:p-12 mb-10 text-white flex justify-between items-center shadow-2xl shadow-indigo-900/20 relative overflow-hidden group transition-all duration-500">
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium mb-4 border border-white/20">
                <Star size={12} className="text-yellow-300 fill-yellow-300" />
                <span>Yapay Zeka Destekli Alışveriş Asistanı</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight tracking-tight">
                En İyi Fiyatı <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-orange-200">Saniyeler İçinde</span> Bul
              </h1>
              <p className="text-indigo-100 dark:text-indigo-200 max-w-lg text-base md:text-lg mb-8 leading-relaxed opacity-90">
                KıyasGO, binlerce mağazayı senin için tarar, analiz eder ve en uygun fiyatı karşına getirir. Fazla ödemeye son.
              </p>
              <div className="flex gap-4">
                <button onClick={() => setChatOpen(true)} className="bg-white text-indigo-600 dark:bg-slate-900 dark:text-indigo-400 px-8 py-3.5 rounded-full font-bold hover:bg-indigo-50 dark:hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center gap-2 group-hover:gap-3">
                  Hemen Keşfet <ArrowRight size={18} />
                </button>
                <button onClick={() => setChatOpen(true)} className="bg-indigo-500/20 backdrop-blur-md border border-white/20 text-white px-6 py-3.5 rounded-full font-bold hover:bg-white/10 transition-all flex items-center gap-2">
                  <MessageCircle size={18} />
                  Asistan'a Sor
                </button>
              </div>
            </div>
            <div className="absolute -right-10 -bottom-20 opacity-20 rotate-12 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 ease-out">
              <Zap size={350} fill="currentColor" />
            </div>
            <div className="absolute top-10 right-1/4 w-32 h-32 bg-rose-500 rounded-full blur-3xl opacity-30 animate-pulse"></div>
          </div>
        )}

        {/* Subcategories for Electronics */}
        {activeTab === 'elektronik' && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Kategoriler</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {ELECTRONICS_SUBCATEGORIES.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setActiveSubcategory(activeSubcategory === sub.id ? null : sub.id)}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200 ${activeSubcategory === sub.id
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                >
                  <span className="text-3xl mb-2">{sub.icon}</span>
                  <span className="text-sm font-medium text-center">{sub.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3 capitalize">
            {activeTab === 'anasayfa' ? (
              <>
                <TrendingUp className="text-rose-500" />
                <span>Popüler Fırsatlar</span>
              </>
            ) : (
              <span>
                {activeTab.replace('-', ' & ')} Fırsatları
                {activeSubcategory && <span className="text-slate-400 dark:text-slate-500 text-lg font-normal ml-2">/ {ELECTRONICS_SUBCATEGORIES.find(s => s.id === activeSubcategory)?.label}</span>}
              </span>
            )}
          </h2>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
            {filteredProducts.length} ürün listelendi
          </span>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => handleProductClick(product)}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-indigo-100/50 dark:hover:shadow-indigo-900/20 hover:-translate-y-1.5 transition-all duration-300 group cursor-pointer relative overflow-hidden"
            >
              <div className="h-56 bg-gradient-to-b from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 flex items-center justify-center text-8xl group-hover:scale-110 transition-transform duration-500 ease-out relative">
                {product.image}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/2 dark:group-hover:bg-white/5 transition-colors duration-300"></div>
              </div>

              <button
                className="absolute top-4 right-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-2.5 rounded-full shadow-sm text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-all z-10 border border-slate-100 dark:border-slate-700 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-300"
                onClick={(e) => { e.stopPropagation(); alert("Favorilere eklendi!"); }}
              >
                <Zap size={18} />
              </button>

              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-1 rounded-md border border-indigo-100 dark:border-indigo-900/50">
                    {product.category}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-500 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded-full border border-amber-100 dark:border-amber-900/50">
                    <Star size={12} fill="currentColor" /> {product.rating}
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {product.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 line-clamp-2 min-h-[2.5em]">
                  {product.desc}
                </p>

                <div className="flex items-end justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400 dark:text-slate-500 line-through mb-0.5">
                      {Math.floor(product.price * 1.1).toLocaleString('tr-TR')} ₺
                    </span>
                    <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                      {product.price.toLocaleString('tr-TR')} <span className="text-sm font-bold text-slate-500 dark:text-slate-400">₺</span>
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none group-hover:scale-110 transition-transform">
                    <ArrowRight size={20} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Full Screen Chat Modal */}
      {chatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-6">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setChatOpen(false)}></div>

          {/* Modal Content */}
          <div className="relative w-full h-full md:max-w-2xl md:h-[600px] bg-white dark:bg-slate-900 md:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-800 dark:to-purple-800 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg"><Zap size={20} fill="currentColor" /></div>
                <div>
                  <h3 className="font-bold text-lg">KıyasGO Asistan</h3>
                  <p className="text-xs text-indigo-100 opacity-80">Yapay zeka ile sohbet et</p>
                </div>
              </div>
              <button onClick={() => setChatOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] md:max-w-[75%] p-4 rounded-2xl text-sm md:text-base leading-relaxed shadow-sm ${msg.role === 'user'
                    ? 'bg-indigo-600 dark:bg-indigo-500 text-white rounded-br-none'
                    : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-bl-none'
                    }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-slate-900 px-4 py-3 rounded-2xl rounded-bl-none border border-slate-200 dark:border-slate-800 flex gap-1 shadow-sm">
                    <div className="w-2 h-2 bg-slate-400 dark:bg-slate-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 dark:bg-slate-600 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-slate-400 dark:bg-slate-600 rounded-full animate-bounce delay-150"></div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-3 shrink-0">
              <input
                name="msgInput"
                type="text"
                placeholder="Bir soru sorun..."
                className="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-800 rounded-full text-base outline-none focus:bg-white dark:focus:bg-slate-950 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                autoFocus
              />
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white p-3 rounded-full transition-colors shadow-md shadow-indigo-200 dark:shadow-none flex items-center justify-center aspect-square">
                <ArrowRight size={24} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-8 mt-auto transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 dark:text-slate-400 text-sm">© 2024 KıyasGO. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </div>
  );
}