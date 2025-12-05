'use client';

import React, { useState, useEffect } from 'react';
import { Star, Truck, ShieldCheck, ArrowLeft, ShoppingCart, Zap, ArrowRight, Smartphone, Battery, Cpu, Wifi, Maximize } from 'lucide-react';
import Link from 'next/link';
import AIRecommendation from '@/app/components/AIRecommendation';
import { ELECTRONICS_SUBCATEGORIES, PRODUCTS_DATA } from '../../data';
import ClientKiyasGo from '../../ClientKiyasGo';
import { supabase } from '@/lib/supabase';
import { useComparison } from '@/app/context/ComparisonContext';
import Header from '@/app/components/Header';
import ComparisonBar from '@/app/components/ComparisonBar';

export default function ProductDetailPage({ params }) {
  const [specs, setSpecs] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null); // New state for gallery
  const [loadingSpecs, setLoadingSpecs] = useState(false);
  const { addToComparison, selectedProducts } = useComparison();

  const productId = params?.productId;
  const category = params?.category;

  // Check if the current route is actually a subcategory
  const isSubcategory = ELECTRONICS_SUBCATEGORIES.some(sub => sub.id === productId);

  const product = PRODUCTS_DATA.find(p => p.id === productId);
  const isSelected = selectedProducts.some(p => p.id === product?.id);

  // Supabase'den veri çekme
  useEffect(() => {
    if (product) {
      const fetchSpecs = async () => {
        setLoadingSpecs(true);
        try {
          console.log("Fetching specs for:", product.name);
          // Ürün ismine göre Supabase'de arama yap
          // % işareti ile esnek arama yapıyoruz
          const { data, error } = await supabase
            .from('phones')
            .select('*')
            .ilike('name', `%${product.name}%`)
            .limit(1)
            .single();

          if (error) {
            console.error("Supabase error:", error);
          }

          if (data) {
            console.log("Specs found:", data);
            setSpecs(data);
            setSelectedImage(product.image); // Initialize with default image
          } else {
            console.log("No specs found for this product.");
          }
        } catch (error) {
          console.error("Specs fetch error:", error);
        } finally {
          setLoadingSpecs(false);
        }
      };

      fetchSpecs();
    }
  }, [product]);

  // If it's a subcategory, render the main client component with the subcategory selected
  if (isSubcategory) {
    return <ClientKiyasGo initialCategory={category} initialSubcategory={productId} />;
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Ürün Bulunamadı</h1>
        <Link href="/" className="mt-4 text-indigo-600 dark:text-indigo-400 hover:underline">Ana Sayfaya Dön</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 pb-32 transition-colors duration-300">

      <Header activeTab={category} />

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Breadcrumb / Back */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium">
            <ArrowLeft size={18} /> Ana Sayfaya Dön
          </Link>
        </div>

        {/* Ürün Kartı */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-indigo-100/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden md:flex mb-10 transition-colors duration-300">
          <div className="md:w-1/2 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 p-8 flex flex-col items-center justify-center relative">

            {/* Main Image View */}
            <div className="text-9xl transform hover:scale-105 transition-transform duration-500 drop-shadow-2xl flex items-center justify-center w-full min-h-[300px] mb-6">
              {(selectedImage || product.image).startsWith('http') ? (
                <img src={selectedImage || product.image} alt={product.name} className="max-w-full max-h-[350px] object-contain animate-in fade-in zoom-in duration-300" />
              ) : (
                <span>{selectedImage || product.image}</span>
              )}
            </div>

            {/* Thumbnails */}
            {specs?.images && specs.images.length > 0 && (
              <div className="flex gap-2 overflow-x-auto w-full px-2 py-2 no-scrollbar justify-center">
                {/* Original Image Thumbnail */}
                <button
                  onClick={() => setSelectedImage(product.image)}
                  className={`w-16 h-16 rounded-xl border-2 overflow-hidden flex-shrink-0 transition-all ${selectedImage === product.image ? 'border-indigo-600 ring-2 ring-indigo-200 dark:ring-indigo-900' : 'border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100'}`}
                >
                  <img src={product.image} alt="Original" className="w-full h-full object-contain bg-white" />
                </button>

                {/* Scraped Images Thumbnails */}
                {specs.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-16 h-16 rounded-xl border-2 overflow-hidden flex-shrink-0 transition-all ${selectedImage === img ? 'border-indigo-600 ring-2 ring-indigo-200 dark:ring-indigo-900' : 'border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100'}`}
                  >
                    <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="absolute top-4 left-4">
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-1 rounded-md border border-indigo-100 dark:border-indigo-900/50">
                {product.category}
              </span>
            </div>
          </div>

          <div className="p-8 md:w-1/2 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1 text-amber-500 dark:text-amber-400 text-sm font-bold bg-amber-50 dark:bg-amber-900/30 px-3 py-1 rounded-full border border-amber-100 dark:border-amber-900/50">
                <Star size={14} fill="currentColor" /> {product.rating}
              </div>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">120+ Değerlendirme</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4 leading-tight">{product.name}</h1>
            <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed text-lg">{product.desc} Yüksek performanslı donanımı ve kullanıcı dostu özellikleriyle öne çıkan bu ürün, kendi kategorisindeki en iyi fiyat/performans oranına sahip seçeneklerden biridir.</p>

            <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1 uppercase tracking-wide">En İyi Fiyat</p>
                <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{product.price.toLocaleString('tr-TR')} <span className="text-lg text-slate-500 dark:text-slate-400 font-bold">₺</span></p>
              </div>
              <button
                onClick={() => addToComparison(product)}
                disabled={isSelected}
                className={`px-8 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-lg transition-all transform active:scale-95 ${isSelected
                  ? 'bg-green-600 text-white shadow-green-200 dark:shadow-none cursor-default'
                  : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white shadow-indigo-200 dark:shadow-none hover:shadow-xl hover:-translate-y-1'
                  }`}
              >
                {isSelected ? <><ShieldCheck size={20} /> Eklendi</> : <><Zap size={20} fill="currentColor" /> Kıyasla</>}
              </button>
            </div>
          </div>
        </div>

        {/* Görsel Galerisi (Lifestyle) */}
        {specs?.images && specs.images.length > 0 && (
          <div className="mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
              <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-lg text-indigo-600 dark:text-indigo-400"><Smartphone size={24} /></div>
              Ürün Görselleri
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {specs.images.map((imgUrl, i) => (
                <div key={i} className={`rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 relative group cursor-pointer ${i === 0 ? 'col-span-2 row-span-2' : ''}`}>
                  <img
                    src={imgUrl}
                    alt={`${product.name} lifestyle ${i + 1}`}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Technical Specs from Supabase */}
        {specs && (
          <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
              <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-lg text-indigo-600 dark:text-indigo-400"><Cpu size={24} /></div>
              Teknik Özellikler
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-start gap-4">
                <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl text-slate-600 dark:text-slate-400"><Maximize size={24} /></div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">Ekran</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">{specs.display}</p>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-start gap-4">
                <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl text-slate-600 dark:text-slate-400"><Battery size={24} /></div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">Batarya</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">{specs.battery}</p>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-start gap-4">
                <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl text-slate-600 dark:text-slate-400"><Smartphone size={24} /></div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">Hafıza & RAM</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    {Array.isArray(specs.storage) ? specs.storage.join(', ') : specs.storage} / {Array.isArray(specs.ram) ? specs.ram.join(', ') : specs.ram}
                  </p>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-start gap-4">
                <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl text-slate-600 dark:text-slate-400"><Wifi size={24} /></div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">Bağlantı</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    {Array.isArray(specs.networks) ? specs.networks.join(', ') : specs.networks}
                  </p>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-600 mt-4 text-center">
              * Veriler GSM Arena üzerinden otomatik çekilmiştir. ({specs.name})
            </p>
          </div>
        )}

        {/* AI Recommendation */}
        <div className="mb-10">
          <AIRecommendation productId={product.id} />
        </div>

        {/* Fiyat Listesi */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3 px-1">
            <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-lg text-indigo-600 dark:text-indigo-400"><ShoppingCart size={24} /></div>
            Mağaza Fiyatları
          </h2>
          <div className="space-y-4">
            {product.prices.map((offer, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all cursor-pointer group">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 dark:text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors text-lg">{i + 1}</div>
                  <div>
                    <p className={`font-bold text-xl ${offer.color}`}>{offer.store}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500 mt-1.5 font-medium">
                      <span className="flex items-center gap-1.5"><Truck size={14} /> Kargo Bedava</span>
                      <span className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full"></span>
                      <span className="flex items-center gap-1.5"><ShieldCheck size={14} /> Garantili</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-slate-900 dark:text-white">{offer.price.toLocaleString('tr-TR')} <span className="text-sm font-bold text-slate-400">₺</span></p>
                  <span className="text-sm text-indigo-600 dark:text-indigo-400 font-bold group-hover:underline flex items-center justify-end gap-1 mt-1">
                    Mağazaya Git <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
      <ComparisonBar />
    </div>
  );
}
