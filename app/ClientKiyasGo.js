'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';  
import { Search, Menu, Zap, X, ChevronRight, Home, Shirt, Tv, Armchair, ArrowRight, ExternalLink, Star, ShoppingBag, TrendingUp } from 'lucide-react';

const generatePrices = (basePrice) => [
  { store: "Trendyol", price: basePrice, color: "text-orange-600" },
  { store: "Hepsiburada", price: basePrice - 500, color: "text-orange-500" },
  { store: "Amazon", price: basePrice + 250, color: "text-yellow-600" },
  { store: "N11", price: basePrice + 100, color: "text-purple-600" },
  { store: "MediaMarkt", price: basePrice + 1000, color: "text-red-600" },
];

const PRODUCTS_DATA = [
  { id: "iphone-15-pro", name: "iPhone 15 Pro", category: "elektronik", price: 75000, image: "📱", desc: "Titanyum tasarım, A17 Pro çip.", rating: 4.8, prices: generatePrices(75000) },
  { id: "samsung-s24-ultra", name: "Samsung S24 Ultra", category: "elektronik", price: 72000, image: "📱", desc: "Galaxy AI özellikleri, 200MP kamera.", rating: 4.7, prices: generatePrices(72000) },
  { id: "dyson-v15", name: "Dyson V15", category: "ev-yasam", price: 25000, image: "🧹", desc: "Lazer teknolojili kablosuz süpürge.", rating: 4.9, prices: generatePrices(25000) },
  { id: "nike-air-max", name: "Nike Air Max", category: "moda", price: 4500, image: "👟", desc: "Günlük kullanım için ikonik tasarım.", rating: 4.5, prices: generatePrices(4500) },
  { id: "sony-wh-1000xm5", name: "Sony WH-1000XM5", category: "elektronik", price: 12000, image: "🎧", desc: "Endüstri lideri gürültü engelleme.", rating: 4.6, prices: generatePrices(12000) },
  { id: "zara-blazer", name: "Zara Blazer Ceket", category: "moda", price: 3200, image: "🧥", desc: "Ofis şıklığı için modern kesim.", rating: 4.3, prices: generatePrices(3200) },
  { id: "philips-airfryer", name: "Philips Airfryer XXL", category: "ev-yasam", price: 8500, image: "🍟", desc: "Az yağ ile çıtır lezzetler.", rating: 4.8, prices: generatePrices(8500) },
  { id: "macbook-air-m2", name: "MacBook Air M2", category: "elektronik", price: 42000, image: "💻", desc: "İnce, hafif ve güçlü M2 işlemci.", rating: 4.9, prices: generatePrices(42000) },
];

export default function ClientKiyasGo({ initialCategory = 'anasayfa' }) {
   const router = useRouter(); 
  
  const [activeTab, setActiveTab] = useState(initialCategory);
  const [searchTerm, setSearchTerm] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Merhaba! Ben KıyasGO Asistan. Fiyatlar ve özellikler hakkında bana soru sorabilirsin.' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  
  const chatEndRef = useRef(null);

  const handleTabChange = (category) => {
    setActiveTab(category);
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
    return matchesSearch && matchesCategory;
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
      className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-300 whitespace-nowrap font-medium text-sm ${
        activeTab === id 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105' 
        : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'
      }`}
    >
      <Icon size={18} />
      <span className="md:inline">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col relative selection:bg-indigo-100 selection:text-indigo-700">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex justify-between items-center w-full md:w-auto">
                <div className="flex items-center gap-8">
                <a href="/" className="text-2xl font-black tracking-tight flex items-center gap-1 group">
                    <span className="text-indigo-600 group-hover:scale-105 transition-transform">Kıyas</span>
                    <span className="bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-transparent group-hover:rotate-3 transition-transform inline-block">GO</span>
                </a>
                <nav className="hidden md:flex gap-1 bg-slate-100/50 p-1 rounded-full border border-slate-200/50">
                    <NavButton id="anasayfa" label="Vitrin" icon={Home} />
                    <NavButton id="elektronik" label="Elektronik" icon={Tv} />
                    <NavButton id="moda" label="Moda" icon={Shirt} />
                    <NavButton id="ev-yasam" label="Ev & Yaşam" icon={Armchair} />
                </nav>
                </div>
                <button className="md:hidden text-slate-600 hover:text-indigo-600 transition-colors"><Menu size={24} /></button>
            </div>
            <div className="relative w-full md:max-w-xs group">
              <input 
                type="text" 
                placeholder="Ürün, marka veya kategori ara..." 
                className="w-full pl-11 pr-4 py-2.5 bg-slate-100 focus:bg-white border border-transparent focus:border-indigo-500 rounded-full text-sm outline-none transition-all shadow-sm focus:shadow-md"
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
              <Search className="absolute left-4 top-2.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
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
            <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-rose-500 rounded-3xl p-8 md:p-12 mb-10 text-white flex justify-between items-center shadow-2xl shadow-indigo-900/20 relative overflow-hidden group">
            <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium mb-4 border border-white/20">
                    <Star size={12} className="text-yellow-300 fill-yellow-300" />
                    <span>Yapay Zeka Destekli Alışveriş Asistanı</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight tracking-tight">
                    En İyi Fiyatı <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-orange-200">Saniyeler İçinde</span> Bul
                </h1>
                <p className="text-indigo-100 max-w-lg text-base md:text-lg mb-8 leading-relaxed opacity-90">
                    KıyasGO, binlerce mağazayı senin için tarar, analiz eder ve en uygun fiyatı karşına getirir. Fazla ödemeye son.
                </p>
                <button className="bg-white text-indigo-600 px-8 py-3.5 rounded-full font-bold hover:bg-indigo-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center gap-2 group-hover:gap-3">
                    Hemen Keşfet <ArrowRight size={18} />
                </button>
            </div>
            <div className="absolute -right-10 -bottom-20 opacity-20 rotate-12 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 ease-out">
                <Zap size={350} fill="currentColor" />
            </div>
            <div className="absolute top-10 right-1/4 w-32 h-32 bg-rose-500 rounded-full blur-3xl opacity-30 animate-pulse"></div>
            </div>
        )}

        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3 capitalize">
                {activeTab === 'anasayfa' ? (
                    <>
                        <TrendingUp className="text-rose-500" />
                        <span>Popüler Fırsatlar</span>
                    </>
                ) : (
                    <span>{activeTab.replace('-', ' & ')} Fırsatları</span>
                )}
            </h2>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                {filteredProducts.length} ürün listelendi
            </span>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
            <div 
                key={product.id} 
                onClick={() => handleProductClick(product)} 
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-100/50 hover:-translate-y-1.5 transition-all duration-300 group cursor-pointer relative overflow-hidden"
            >
              <div className="h-56 bg-gradient-to-b from-slate-50 to-white flex items-center justify-center text-8xl group-hover:scale-110 transition-transform duration-500 ease-out relative">
                {product.image}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/2 transition-colors duration-300"></div>
              </div>
              
              <button 
                className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2.5 rounded-full shadow-sm text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all z-10 border border-slate-100 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-300"
                onClick={(e) => { e.stopPropagation(); alert("Favorilere eklendi!"); }}
              >
                <Zap size={18} />
              </button>

              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                   <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                    {product.category}
                   </span>
                   <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded-full border border-amber-100">
                    <Star size={12} fill="currentColor" /> {product.rating}
                   </div>
                </div>
                
                <h3 className="font-bold text-slate-900 text-lg mb-2 leading-tight group-hover:text-indigo-600 transition-colors">
                    {product.name}
                </h3>
                <p className="text-xs text-slate-500 mb-5 line-clamp-2 min-h-[2.5em]">
                    {product.desc}
                </p>
                
                <div className="flex items-end justify-between pt-4 border-t border-slate-50">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400 line-through mb-0.5">
                        {Math.floor(product.price * 1.1).toLocaleString('tr-TR')} ₺
                    </span>
                    <span className="text-xl font-black text-slate-900 tracking-tight">
                        {product.price.toLocaleString('tr-TR')} <span className="text-sm font-bold text-slate-500">₺</span>
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
                    <ArrowRight size={20} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Chat Widget */}
      <div className="fixed bottom-0 right-0 w-full md:w-auto md:right-8 z-50 pointer-events-none">
         <div className="pointer-events-auto bg-white border border-slate-200 rounded-t-2xl shadow-2xl md:mb-0 md:rounded-t-xl md:w-[380px] overflow-hidden">
            <div 
                className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white cursor-pointer flex items-center justify-between hover:opacity-95 transition-opacity" 
                onClick={() => setChatOpen(!chatOpen)}
            >
               <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-1.5 rounded-lg"><Zap size={18} fill="currentColor" /></div>
                    <div>
                        <h3 className="font-bold text-sm">KıyasGO Asistan</h3>
                        <p className="text-[10px] text-indigo-100 opacity-80">Yapay zeka ile sohbet et</p>
                    </div>
               </div>
               {chatOpen ? <X size={20} /> : <ChevronRight size={20} className="-rotate-90" />}
            </div>
            
            {chatOpen && (
               <div className="h-[450px] flex flex-col bg-slate-50">
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                     {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                           <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                               msg.role === 'user' 
                               ? 'bg-indigo-600 text-white rounded-br-none' 
                               : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                            }`}>
                                {msg.text}
                           </div>
                        </div>
                     ))}
                     {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none border border-slate-200 flex gap-1 shadow-sm">
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                            </div>
                        </div>
                     )}
                     <div ref={chatEndRef} />
                  </div>
                  <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex gap-2">
                     <input 
                        name="msgInput" 
                        type="text" 
                        placeholder="Bir soru sorun..." 
                        className="flex-1 px-4 py-2.5 bg-slate-100 rounded-full text-sm outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all" 
                     />
                     <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-full transition-colors shadow-md shadow-indigo-200">
                        <ArrowRight size={18} />
                     </button>
                  </form>
               </div>
            )}
         </div>
      </div>
      
      {/* Simple Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-slate-500 text-sm">© 2024 KıyasGO. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </div>
  );
}