'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';  
import { Search, Menu, Zap, X, ChevronRight, Home, Shirt, Tv, Armchair, ArrowRight, ExternalLink, Star } from 'lucide-react';

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
  const [selectedProduct, setSelectedProduct] = useState(null);
  
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
    
    
    console.log(`Ürün detayına gidiliyor: ${product.name}`);
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
      className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all whitespace-nowrap ${
        activeTab === id ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <Icon size={18} />
      <span className="md:inline font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 flex flex-col relative">
      <header className="bg-white shadow-sm sticky top-0 z-40 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex justify-between items-center w-full md:w-auto">
                <div className="flex items-center gap-8">
                <a href="/" className="text-2xl font-black text-blue-600 tracking-tight flex items-center gap-1">
                    Kıyas<span className="text-red-600">GO</span>
                </a>
                <nav className="hidden md:flex gap-2">
                    <NavButton id="anasayfa" label="Vitrin" icon={Home} />
                    <NavButton id="elektronik" label="Elektronik" icon={Tv} />
                    <NavButton id="moda" label="Moda" icon={Shirt} />
                    <NavButton id="ev-yasam" label="Ev & Yaşam" icon={Armchair} />
                </nav>
                </div>
                <button className="md:hidden text-gray-600"><Menu size={24} /></button>
            </div>
            <div className="relative w-full md:max-w-xs">
              <input type="text" placeholder="Ara..." className="w-full pl-10 pr-4 py-2 bg-gray-100 focus:bg-white border border-transparent focus:border-blue-500 rounded-full text-sm outline-none transition-all"
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              <Search className="absolute left-3.5 top-2 text-gray-400" size={18} />
            </div>
          </div>
          <div className="flex md:hidden gap-2 mt-3 overflow-x-auto pb-2 no-scrollbar">
             <NavButton id="anasayfa" label="Tümü" icon={Home} />
             <NavButton id="elektronik" label="Elektro" icon={Tv} />
             <NavButton id="moda" label="Moda" icon={Shirt} />
             <NavButton id="ev-yasam" label="Ev" icon={Armchair} />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full pb-32">
        {activeTab === 'anasayfa' && !searchTerm && (
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 md:p-10 mb-8 text-white flex justify-between items-center shadow-lg shadow-blue-900/20 relative overflow-hidden">
            <div className="relative z-10">
                <h1 className="text-2xl md:text-4xl font-bold mb-2">En İyi Fiyatı Anında Bul</h1>
                <p className="text-blue-100 max-w-md text-sm md:text-base">KıyasGO, tüm mağazaları senin için tarar ve en uygun fiyatı karşına getirir.</p>
            </div>
            <div className="absolute right-0 bottom-0 opacity-10 rotate-12 transform translate-x-1/4 translate-y-1/4"><Zap size={200} fill="currentColor" /></div>
            </div>
        )}

        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 capitalize">
           {activeTab === 'anasayfa' ? 'Popüler Fırsatlar' : `${activeTab.replace('-', ' & ')} Fırsatları`}
           <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{filteredProducts.length} ürün</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} onClick={() => handleProductClick(product)} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer relative">
              <div className="h-48 bg-gray-50 flex items-center justify-center text-7xl group-hover:scale-110 transition-transform duration-300">{product.image}</div>
              <button className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-sm text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors z-10"
                onClick={(e) => { e.stopPropagation(); alert("Kıyaslama listesine eklendi!"); }}><Zap size={18} /></button>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                   <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded">{product.category}</span>
                   <div className="flex items-center gap-1 text-xs font-bold text-orange-500"><Star size={12} fill="currentColor" /> {product.rating}</div>
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">{product.name}</h3>
                <p className="text-xs text-gray-500 mb-4 line-clamp-2">{product.desc}</p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400 line-through">{Math.floor(product.price * 1.1).toLocaleString('tr-TR')} ₺</span>
                    <span className="text-lg font-bold text-gray-900">{product.price.toLocaleString('tr-TR')} ₺</span>
                  </div>
                  <div className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-full">İncele</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <div className="fixed bottom-0 right-0 w-full md:w-auto md:right-8 z-50">
         <div className="bg-white border border-gray-200 rounded-t-2xl shadow-2xl md:mb-0 md:rounded-t-xl md:w-[400px]">
            <div className="p-4 bg-blue-600 text-white cursor-pointer rounded-t-xl flex items-center justify-between" onClick={() => setChatOpen(!chatOpen)}>
               <div className="flex items-center gap-3"><Zap size={18} fill="currentColor" /><h3 className="font-bold text-sm">KıyasGO AI Asistan</h3></div>
               {chatOpen ? <X size={18} /> : <ChevronRight size={18} className="-rotate-90" />}
            </div>
            {chatOpen && (
               <div className="h-[400px] flex flex-col bg-white">
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                     {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                           <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'}`}>{msg.text}</div>
                        </div>
                     ))}
                     {isTyping && <div className="flex justify-start"><div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none border border-gray-200 flex gap-1">...</div></div>}
                     <div ref={chatEndRef} />
                  </div>
                  <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-200 flex gap-2">
                     <input name="msgInput" type="text" placeholder="Bir soru sorun..." className="flex-1 px-4 py-2 bg-gray-100 rounded-full text-sm outline-none" />
                     <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full"><ArrowRight size={18} /></button>
                  </form>
               </div>
            )}
         </div>
      </div>
    </div>
  );
}