'use client';

import React, { useState, useEffect } from 'react';
import { Star, Truck, ShieldCheck, ArrowLeft, ShoppingCart, Zap, ArrowRight, Smartphone, Battery, Cpu, Wifi, Maximize, Home, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import AIRecommendation from '@/app/components/AIRecommendation';
import ReviewSummary from '@/app/components/ReviewSummary';
import { ELECTRONICS_SUBCATEGORIES, PRODUCTS_DATA } from '../data';
import ClientKiyasGo from '../ClientKiyasGo';
import { supabase } from '@/lib/supabase';
import { useComparison } from '@/app/context/ComparisonContext';
import Header from '@/app/components/Header';
import ComparisonBar from '@/app/components/ComparisonBar';

export default function ProductDetailView({ params, initialProduct }) {
    const productId = params?.productId;
    const category = params?.category;

    // Try to find in local data first (for instant render)
    const product = PRODUCTS_DATA.find(p => p.id === productId);

    // Initial state setup to handle server-passed data
    const [supabaseData, setSupabaseData] = useState(null);
    const [loading, setLoading] = useState(!product && !initialProduct);

    // Helper to process raw supabase data
    const processSupabaseData = (data) => {
        const getStoreColor = (name) => {
            if (!name) return "text-slate-900 dark:text-white";
            const lower = name.toLowerCase();
            if (lower.includes('trendyol')) return "text-orange-600 dark:text-orange-500 font-bold";
            if (lower.includes('hepsiburada')) return "text-orange-500 dark:text-orange-400 font-bold";
            if (lower.includes('amazon')) return "text-yellow-600 dark:text-yellow-500 font-bold";
            if (lower.includes('n11')) return "text-red-600 dark:text-red-500 font-bold";
            if (lower.includes('media')) return "text-red-700 dark:text-red-600 font-bold";
            if (lower.includes('tekno')) return "text-blue-600 dark:text-blue-500 font-bold";
            if (lower.includes('vatan')) return "text-blue-800 dark:text-blue-400 font-bold";
            if (lower.includes('ptt')) return "text-yellow-500 dark:text-yellow-400 font-bold";
            return "text-slate-900 dark:text-white font-medium";
        };

        const images = [];
        if (data.image) images.push(data.image);
        if (data.image2) images.push(data.image2);
        if (data.image3) images.push(data.image3);
        if (data.image4) images.push(data.image4);
        if (data.image5) images.push(data.image5);

        const stores = [];
        // Add Primary Store
        if (data.price) {
            stores.push({
                store: data.store1_name || "En İyi Fiyat",
                price: data.price,
                link: data.link,
                color: getStoreColor(data.store1_name)
            });
        }

        if (data.store2_price) stores.push({ store: data.store2_name || "Mağaza 2", price: data.store2_price, link: data.store2_link, color: getStoreColor(data.store2_name) });
        if (data.store3_price) stores.push({ store: data.store3_name || "Mağaza 3", price: data.store3_price, link: data.store3_link, color: getStoreColor(data.store3_name) });
        if (data.store4_price) stores.push({ store: data.store4_name || "Mağaza 4", price: data.store4_price, link: data.store4_link, color: getStoreColor(data.store4_name) });
        if (data.store5_price) stores.push({ store: data.store5_name || "Mağaza 5", price: data.store5_price, link: data.store5_link, color: getStoreColor(data.store5_name) });

        return {
            ...data,
            stores: stores.length > 0 ? stores : [],
            images: images.length > 0 ? images : [],
            price: data.price,
            image: data.image || '',
            store1_name: data.store1_name
        };
    };

    // Construct displayProduct
    const processedInitial = React.useMemo(() => initialProduct ? processSupabaseData(initialProduct) : null, [initialProduct]);
    const activeSupabaseData = supabaseData || processedInitial;

    // Prefer Supabase data if available, else local
    const displayProduct = activeSupabaseData ? { ...product, ...activeSupabaseData, name: activeSupabaseData.name } : product;

    const specs = supabaseData?.specs || displayProduct?.specs || null;
    const galleryImages = supabaseData?.images || displayProduct?.images || [];
    const storePrices = supabaseData?.stores || displayProduct?.stores || displayProduct?.prices || [];

    const [selectedImage, setSelectedImage] = useState(null);
    const [variants, setVariants] = useState([]);

    useEffect(() => {
        if (!selectedImage && displayProduct) {
            setSelectedImage(displayProduct.image);
        }
    }, [displayProduct, selectedImage]);

    // Fetch Variants (Siblings based on Name Similarity)
    useEffect(() => {
        const fetchVariants = async () => {
            if (!displayProduct?.name) return;

            // 1. Extract Base Name (Remove GB/TB, RAM, and Brand Prefixes)
            // Example: "Apple iPhone 15 Pro 128 GB" -> "iPhone 15 Pro"
            // Example: "Samsung Galaxy Tab S9 256 GB" -> "Samsung Galaxy Tab S9"
            let baseName = displayProduct.name
                .replace(/^(Apple|Samsung|Xiaomi|Huawei|Oppo|Vivo|Realme|OnePlus|General Mobile|Reeder|Casper|Honor|Poco|Tecno|Infinix|Google|Asus|Sony|Vestel|Omix)\s+/i, '') // Remove Brand Prefix
                .replace(/\s(16|32|64|128|256|512)\s?GB/gi, '')
                .replace(/\s1\s?TB/gi, '')
                .replace(/\s\d{1,2}\s?GB\s?RAM/gi, '') // Remove RAM info if in title
                .trim();

            if (!baseName || baseName.length < 3) return;

            try {
                const { data } = await supabase
                    .from('products')
                    .select('id, name, slug, specs, image')
                    .ilike('name', `%${baseName}%`) // Search with wildcard
                    .limit(30);

                if (data && data.length > 1) {
                    // Filter to ensure high similarity and extract storage
                    const cleanVariants = data.map(v => {
                        let storage = null;

                        // Parse storage from Name or Specs
                        const nameMatch = v.name.match(/(16|32|64|128|256|512)\s?GB|1\s?TB/i);
                        if (nameMatch) {
                            storage = nameMatch[0].toUpperCase();
                        } else if (v.specs?.storage) {
                            storage = v.specs.storage;
                        }

                        // Check if it's the SAME base model
                        // We must ensure that if baseName is "iPhone 15 Pro", we don't include "iPhone 15 Pro Max"
                        let vNameNormalized = v.name
                            .replace(/^(Apple|Samsung|Xiaomi|Huawei|Oppo|Vivo|Realme|OnePlus|General Mobile|Reeder|Casper|Honor|Poco|Tecno|Infinix|Google|Asus|Sony|Vestel|Omix)\s+/i, '')
                            .replace(/\s(16|32|64|128|256|512)\s?GB/gi, '')
                            .replace(/\s1\s?TB/gi, '')
                            .replace(/\s\d{1,2}\s?GB\s?RAM/gi, '')
                            .trim();

                        // Exact match on Normalized Base Name required
                        // Case insensitive match
                        if (vNameNormalized.toLowerCase() !== baseName.toLowerCase()) return null;

                        return {
                            ...v,
                            storage: storage || 'Standart', // Fallback
                            isActive: v.slug === displayProduct.slug || v.name === displayProduct.name
                        };
                    })
                        .filter(v => v !== null) // Remove mismatched base models
                        .filter(v => v.storage && (v.storage.includes('GB') || v.storage.includes('TB'))) // Strictly keep only GB/TB variants
                        .sort((a, b) => {
                            // Sort by storage size (GB)
                            const getVal = (s) => {
                                if (!s) return 0;
                                if (s.includes('TB')) return parseInt(s) * 1024;
                                return parseInt(s);
                            }
                            return getVal(a.storage) - getVal(b.storage);
                        });

                    // Filter unique storages (take first found per size if dupes exist)
                    const uniqueVariants = [];
                    const seen = new Set();
                    cleanVariants.forEach(v => {
                        if (!seen.has(v.storage)) {
                            seen.add(v.storage);
                            uniqueVariants.push(v);
                        }
                    });

                    if (uniqueVariants.length > 0) {
                        setVariants(uniqueVariants);
                    }
                }
            } catch (err) {
                console.error("Variant fetch error:", err);
            }
        };

        fetchVariants();
    }, [displayProduct?.name, displayProduct?.slug]);

    useEffect(() => {
        if (initialProduct) {
            if (activeSupabaseData?.image && !selectedImage) {
                setSelectedImage(activeSupabaseData.image);
            }
            return;
        }

        const fetchProductData = async () => {
            try {
                // 1. Try to find by SLUG first (most accurate)
                let { data } = await supabase
                    .from('products')
                    .select('*')
                    .eq('slug', productId)
                    .maybeSingle();

                // 2. If valid slug not found, try by NAME (if we have a local product reference)
                if (!data && product) {
                    const { data: nameData } = await supabase
                        .from('products')
                        .select('*')
                        .eq('name', product.name)
                        .maybeSingle();
                    data = nameData;
                }

                if (data) {
                    setSupabaseData(processSupabaseData(data));
                    if (data.image && !selectedImage) {
                        setSelectedImage(data.image);
                    }
                } else if (!product) {
                    console.log("No data found for", productId);
                }
            } catch (e) {
                console.error("Fetch error", e);
            } finally {
                setLoading(false);
            }
        };

        if (productId) {
            fetchProductData();
        }
    }, [product, productId, initialProduct]);

    const { addToComparison, selectedProducts } = useComparison();
    const isSelected = selectedProducts?.some(p => p.id === displayProduct?.id);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!displayProduct) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 font-sans transition-colors duration-300">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Ürün Bulunamadı</h1>
                <Link href="/" className="mt-4 text-indigo-600 dark:text-indigo-400 hover:underline">Ana Sayfaya Dön</Link>
                <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 text-xs font-mono text-red-600 dark:text-red-400">
                    <p>DEBUG INFO:</p>
                    <p>Product ID: "{productId}"</p>
                    <p>Category: "{category}"</p>
                    <p>Params: {JSON.stringify(params)}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 pb-32 transition-colors duration-300">
            <Header activeTab={category} />

            {/* Breadcrumb Navigation */}
            <div className="max-w-5xl mx-auto px-4 py-4">
                <nav className="flex items-center text-xs md:text-sm text-slate-500 dark:text-slate-400 overflow-x-auto whitespace-nowrap pb-2 md:pb-0 no-scrollbar">
                    <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1">
                        <Home size={14} /> Anasayfa
                    </Link>
                    <ChevronRight size={14} className="mx-1 md:mx-2 shrink-0 opacity-50" />
                    <Link href={`/${displayProduct.category || category}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 capitalize">
                        {displayProduct.category || category}
                    </Link>
                    {displayProduct.subcategory && (
                        <>
                            <ChevronRight size={14} className="mx-1 md:mx-2 shrink-0 opacity-50" />
                            <Link href={`/${displayProduct.category || category}/${displayProduct.subcategory}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 capitalize">
                                {displayProduct.subcategory}
                            </Link>
                        </>
                    )}
                    <ChevronRight size={14} className="mx-1 md:mx-2 shrink-0 opacity-50" />
                    <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[150px] md:max-w-xs block">
                        {displayProduct.name}
                    </span>
                </nav>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-8">

                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-indigo-100/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden md:flex mb-10 transition-colors duration-300">
                    <div className="md:w-1/2 bg-white dark:bg-slate-900 p-8 flex flex-col items-center justify-center relative transition-colors duration-300">
                        <div className="bg-white rounded-3xl p-6 w-full shadow-sm mb-6 flex items-center justify-center min-h-[300px]">
                            <div className="transform hover:scale-105 transition-transform duration-500 drop-shadow-lg w-full flex items-center justify-center">
                                {(selectedImage || displayProduct.image).startsWith('http') ? (
                                    <img src={selectedImage || displayProduct.image} alt={displayProduct.name} className="max-w-full max-h-[350px] object-contain animate-in fade-in zoom-in duration-300" />
                                ) : (
                                    <span>{selectedImage || displayProduct.image}</span>
                                )}
                            </div>
                        </div>

                        {galleryImages.length > 0 && (
                            <div className="flex gap-2 overflow-x-auto w-full px-2 py-2 no-scrollbar justify-center">
                                <button
                                    onClick={() => setSelectedImage(displayProduct.image)}
                                    className={`w-16 h-16 rounded-xl border-2 overflow-hidden flex-shrink-0 transition-all ${selectedImage === displayProduct.image ? 'border-indigo-600 ring-2 ring-indigo-200 dark:ring-indigo-900' : 'border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100'}`}
                                >
                                    <img src={displayProduct.image} alt="Original" className="w-full h-full object-contain bg-white" />
                                </button>
                                {galleryImages.map((img, idx) => (
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
                                {displayProduct.category}
                            </span>
                        </div>
                    </div>

                    <div className="p-8 md:w-1/2 flex flex-col justify-center">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 text-amber-500 dark:text-amber-400 text-sm font-bold bg-amber-50 dark:bg-amber-900/30 px-3 py-1 rounded-full border border-amber-100 dark:border-amber-900/50">
                                    <Star size={14} fill="currentColor" /> {displayProduct.rating}
                                </div>
                                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">120+ Değerlendirme</span>
                            </div>
                            <button
                                onClick={() => addToComparison(displayProduct)}
                                disabled={isSelected}
                                className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-all transform active:scale-95 text-xs md:text-sm ${isSelected
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 cursor-default'
                                    : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50'
                                    }`}
                            >
                                {isSelected ? <><ShieldCheck size={16} /> Eklendi</> : <><Zap size={16} fill="currentColor" /> Kıyasla</>}
                            </button>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4 leading-tight">{displayProduct.name}</h1>

                        {/* VARIANTS SECTION */}
                        {variants.length > 0 && (
                            <div className="mb-6 animate-in fade-in slide-in-from-left-4 duration-500">
                                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                                    Depolama Seçenekleri:
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {variants.map((v) => (
                                        <Link
                                            key={v.slug || v.name}
                                            href={`/${displayProduct.category || category || 'elektronik'}/${v.slug || v.id}`}
                                            className={`px-4 py-2 rounded-lg border text-sm font-bold transition-all relative overflow-hidden ${v.isActive
                                                ? 'bg-indigo-600 dark:bg-indigo-500 text-white border-indigo-600 dark:border-indigo-500 shadow-md transform scale-105 cursor-default'
                                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-md hover:-translate-y-0.5'
                                                }`}
                                        >
                                            {v.storage}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed text-lg">{displayProduct.desc} Yüksek performanslı donanımı ve kullanıcı dostu özellikleriyle öne çıkan bu ürün, kendi kategorisindeki en iyi fiyat/performans oranına sahip seçeneklerden biridir.</p>

                        <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
                            <div>
                                <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mb-1 flex items-center gap-1">
                                    {(supabaseData?.store1_name || "En İyi Fiyat")}
                                    {supabaseData?.store1_name && <span className="text-xs text-slate-400 font-normal ml-1">• En Ucuz</span>}
                                </p>
                                <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{(supabaseData?.price || displayProduct.price).toLocaleString('tr-TR')} <span className="text-lg text-slate-500 dark:text-slate-400 font-bold">₺</span></p>
                            </div>
                            <a
                                href={storePrices?.[0]?.link || displayProduct.link || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-8 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none transition-all transform hover:-translate-y-1 hover:shadow-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white min-w-[200px] justify-center"
                            >
                                Ürüne Git <ArrowRight size={20} />
                            </a>
                        </div>
                    </div>
                </div>



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

                <div className="mb-8">
                    <ReviewSummary productName={displayProduct.name} />
                </div>

                <div className="mb-10">
                    <AIRecommendation productId={product?.id} />
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3 px-1">
                        <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-lg text-indigo-600 dark:text-indigo-400"><ShoppingCart size={24} /></div>
                        Mağaza Fiyatları
                    </h2>
                    <div className="space-y-4">
                        {storePrices.map((offer, i) => (
                            <a
                                key={i}
                                href={offer.link || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all cursor-pointer group block"
                            >
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
                            </a>
                        ))}
                    </div>
                </div>

            </div>
            <ComparisonBar />
        </div>
    );
}
