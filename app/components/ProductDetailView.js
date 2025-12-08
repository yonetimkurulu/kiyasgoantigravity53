"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Star, ShieldCheck, Zap, Truck, ArrowRight, ChevronRight, Home, ShoppingCart, Cpu, Maximize, Battery, Smartphone, Wifi, Camera } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Header from './Header';
import ComparisonBar from './ComparisonBar';
import { useComparison } from '@/app/context/ComparisonContext';
import ReviewSummary from './ReviewSummary';
import AIRecommendation from './AIRecommendation';
import { generatePrices } from '../data';
import { PRODUCTS_SPECS } from '../../scripts/product_specs_data';

export default function ProductDetailView({ product, initialProduct, category, params }) {
    // Merge product sources
    const mergedProduct = initialProduct || product;

    // Correctly resolve productId from various sources (params.productId is key for app/[category]/[productId] route)
    const productId = params?.productId || params?.slug || mergedProduct?.id || mergedProduct?.slug;

    const [variants, setVariants] = useState([]);
    // Only loading if we don't have initial data
    const [loading, setLoading] = useState(!mergedProduct);
    const [selectedImage, setSelectedImage] = useState(null);
    const [supabaseData, setSupabaseData] = useState(null);
    const [triggerReview, setTriggerReview] = useState(false);

    const specsRef = React.useRef(null);
    const reviewRef = React.useRef(null);

    const scrollToSection = (section) => {
        if (section === 'specs' && specsRef.current) {
            specsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (section === 'review' && reviewRef.current) {
            setTriggerReview(true); // Trigger review generation
            setTimeout(() => {
                reviewRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    };

    // Helper to process fetched data
    const processSupabaseData = (data) => {
        if (!data) return null;
        return {
            ...data,
            store1_name: data.source || data.store1_name,
            store1_price: data.price || data.store1_price,
            link: data.link || data.store1_link
        };
    };

    const activeSupabaseData = supabaseData || (mergedProduct ? processSupabaseData(mergedProduct) : null);
    const displayProduct = activeSupabaseData || mergedProduct || {};

    const galleryImages = [
        displayProduct.image,
        displayProduct.image2,
        displayProduct.image3,
        displayProduct.image4,
        displayProduct.image5
    ].filter(Boolean);

    // Parse specs if they exist, or check static fallback (with fuzzy matching)
    const staticSpecs = React.useMemo(() => {
        if (PRODUCTS_SPECS[productId]) return PRODUCTS_SPECS[productId];
        if (PRODUCTS_SPECS[displayProduct.slug]) return PRODUCTS_SPECS[displayProduct.slug];

        // Fuzzy Match Logic
        const currentSlug = (productId || displayProduct.slug || '').toLowerCase();

        // Find best matching key in PRODUCTS_SPECS
        const bestMatchKey = Object.keys(PRODUCTS_SPECS).find(key => {
            const keySlug = key.toLowerCase();
            // 1. Direct inclusion
            if (currentSlug.includes(keySlug) || keySlug.includes(currentSlug)) return true;

            // 2. Token overlap (if key has multiple tokens, all must be present in currentSlug)
            const keyTokens = keySlug.split(/[-_\s]+/);
            // Ensure significant overlap (e.g. if key is "monster-tulpar", both tokens must be in currentSlug)
            if (keyTokens.length > 1 && keyTokens.every(t => currentSlug.includes(t))) return true;

            return false;
        });

        return bestMatchKey ? PRODUCTS_SPECS[bestMatchKey] : null;

    }, [productId, displayProduct.slug]);

    const specs = displayProduct.specs || staticSpecs || null;

    // Store Prices Logic
    const storePrices = React.useMemo(() => {
        if (displayProduct.stores && displayProduct.stores.length > 0) {
            return displayProduct.stores;
        }
        // Fallback or specific columns
        const stores = [];
        if (displayProduct.store1_name) stores.push({ store: displayProduct.store1_name, price: displayProduct.store1_price || displayProduct.price, link: displayProduct.link, color: 'text-indigo-600' });
        if (displayProduct.store2_name) stores.push({ store: displayProduct.store2_name, price: displayProduct.store2_price, link: displayProduct.store2_link, color: 'text-orange-500' });
        if (displayProduct.store3_name) stores.push({ store: displayProduct.store3_name, price: displayProduct.store3_price, link: displayProduct.store3_link, color: 'text-blue-600' });

        if (stores.length > 0) return stores;
        return generatePrices(displayProduct.price || 0); // Fallback generator
    }, [displayProduct]);


    // FETCH VARIANTS
    useEffect(() => {
        if (!displayProduct?.name || !displayProduct?.slug) return;

        const fetchVariants = async () => {
            // 1. Extract Base Name (Remove GB/TB, RAM, and Brand Prefixes)
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
                    .select('id, name, slug, image') // REMOVED SPECS from query
                    .ilike('name', `%${baseName}%`)
                    .limit(30);

                if (data && data.length > 1) {
                    // Filter to ensure high similarity and extract storage
                    const cleanVariants = data.map(v => {
                        let storage = null;

                        // Parse storage from Name
                        const nameMatch = v.name.match(/(16|32|64|128|256|512)\s?GB|1\s?TB/i);
                        if (nameMatch) {
                            storage = nameMatch[0].toUpperCase();
                        }

                        // Normalize checks
                        let vNameNormalized = v.name
                            .replace(/^(Apple|Samsung|Xiaomi|Huawei|Oppo|Vivo|Realme|OnePlus|General Mobile|Reeder|Casper|Honor|Poco|Tecno|Infinix|Google|Asus|Sony|Vestel|Omix)\s+/i, '')
                            .replace(/\s(16|32|64|128|256|512)\s?GB/gi, '')
                            .replace(/\s1\s?TB/gi, '')
                            .replace(/\s\d{1,2}\s?GB\s?RAM/gi, '')
                            .trim();

                        if (vNameNormalized.toLowerCase() !== baseName.toLowerCase()) return null;

                        return {
                            ...v,
                            storage: storage || 'Standart',
                            isActive: v.slug === displayProduct.slug || v.name === displayProduct.name
                        };
                    })
                        .filter(v => v !== null)
                        .filter(v => v.storage && (v.storage.includes('GB') || v.storage.includes('TB')))
                        .sort((a, b) => {
                            const getVal = (s) => {
                                if (!s) return 0;
                                if (s.includes('TB')) return parseInt(s) * 1024;
                                return parseInt(s);
                            }
                            return getVal(a.storage) - getVal(b.storage);
                        });

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
        if (mergedProduct) {
            if (activeSupabaseData?.image && !selectedImage) {
                setSelectedImage(activeSupabaseData.image);
            }
            return;
        }

        const fetchProductData = async () => {
            // If no product ID, we can't fetch. Stop loading.
            if (!productId) {
                setLoading(false);
                return;
            }

            try {
                let { data } = await supabase
                    .from('products')
                    .select('*')
                    .eq('slug', productId)
                    .maybeSingle();

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

        // Always attempt fetch if we don't have mergedProduct, or just to handle selected image sync
        fetchProductData();

    }, [product, productId, mergedProduct]);

    const { addToComparison, selectedProducts } = useComparison();
    const isSelected = selectedProducts?.some(p => p.id === displayProduct?.id);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!displayProduct || !displayProduct.name) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 font-sans transition-colors duration-300">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Ürün Bulunamadı</h1>
                <Link href="/" className="mt-4 text-indigo-600 dark:text-indigo-400 hover:underline">Ana Sayfaya Dön</Link>
                <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 text-xs font-mono text-red-600 dark:text-red-400">
                    <p>DEBUG INFO:</p>
                    <p>Product ID: "{productId}"</p>
                </div>
            </div>
        );
    }

    // Normalize specs for display
    const normalizedSpecs = React.useMemo(() => {
        if (!specs) return null;

        // Define potential fields to show based on what's available
        // Priority: Display, Processor, Storage, Battery, Camera, Power, Capacity, Generic
        const fields = [];

        // Helper to add field if exists
        const add = (label, value, icon) => {
            if (value && !fields.some(f => f.label === label)) fields.push({ label, value, icon });
        };

        // Screen / Display
        const screenVal = specs.screen || specs.display || specs.resolution;
        if (screenVal) add('Ekran / Çözünürlük', screenVal, <Maximize size={24} />);

        // Processor / CPU / Power (for appliances)
        const cpuVal = specs.processor || specs.cpu || specs.power || specs.suction;
        if (cpuVal) add('İşlemci / Güç', cpuVal, <Zap size={24} />);

        // RAM / Capacity / Storage
        const ramVal = specs.ram || specs.memory;
        const storageVal = specs.storage || specs.capacity; // Capacity for machines

        if (ramVal && storageVal) {
            add('Hafıza & RAM', `${Array.isArray(storageVal) ? storageVal.join(', ') : storageVal} / ${Array.isArray(ramVal) ? ramVal.join(', ') : ramVal}`, <Smartphone size={24} />);
        } else if (storageVal) {
            add('Kapasite / Hafıza', Array.isArray(storageVal) ? storageVal.join(', ') : storageVal, <Smartphone size={24} />);
        } else if (ramVal) {
            add('Bellek', Array.isArray(ramVal) ? ramVal.join(', ') : ramVal, <Smartphone size={24} />);
        }

        // Battery / Energy / Type
        const batteryVal = specs.battery || specs.energy || specs.runtime;
        if (batteryVal) add('Batarya / Enerji', batteryVal, <Battery size={24} />);

        // If we still have few fields, look for others
        if (fields.length < 4) {
            if (specs.camera) add('Kamera', specs.camera, <Camera size={24} />);
            if (specs.os) add('İşletim Sistemi', specs.os, <Cpu size={24} />);
            if (specs.gpu) add('Ekran Kartı', specs.gpu, <Cpu size={24} />);
            if (specs.technology) add('Teknoloji', specs.technology, <Cpu size={24} />);
            if (specs.type) add('Tip', specs.type, <Home size={24} />);
        }

        return fields.slice(0, 4); // Show top 4
    }, [specs]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 pb-32 transition-colors duration-300">
            <Header activeTab={category} />

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
                                {displayProduct.subcategory?.replace(/-/g, ' ')}
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
                                    <Star size={14} fill="currentColor" /> {Number(displayProduct.rating).toFixed(1)}
                                </div>
                                <button onClick={() => scrollToSection('review')} className="text-xs text-slate-400 dark:text-slate-500 font-medium hover:text-indigo-600 hover:underline">
                                    120+ Değerlendirme
                                </button>
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
                        <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-4 leading-tight">{displayProduct.name}</h1>

                        {variants.length > 0 && (
                            <div className="mb-6 animate-in fade-in slide-in-from-left-4 duration-500">
                                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                                    Seçenekler:
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {variants.map((v) => (
                                        <Link
                                            key={v.slug || v.name}
                                            href={`/${displayProduct.category || category || 'elektronik'}/${displayProduct.subcategory || 'cep-telefonu'}/${v.slug || v.id}`}
                                            className={`min-w-[80px] px-4 py-3 rounded-lg border text-sm font-bold transition-all text-center flex items-center justify-center ${v.isActive
                                                ? 'bg-white dark:bg-slate-800 text-black dark:text-white border-slate-900 dark:border-white ring-1 ring-slate-900 dark:ring-white shadow-sm cursor-default bg-slate-50'
                                                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-900 dark:hover:text-white'
                                                }`}
                                        >
                                            {v.storage}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed text-sm">{displayProduct.desc} Yüksek performanslı donanımı ve kullanıcı dostu özellikleriyle öne çıkan bu ürün, kendi kategorisindeki en iyi fiyat/performans oranına sahip seçeneklerden biridir.</p>

                        <button
                            onClick={() => scrollToSection('specs')}
                            className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline mb-8 flex items-center gap-1"
                        >
                            Teknik Özellikler <ChevronRight size={14} />
                        </button>

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

                <div className="mb-6">
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

                {normalizedSpecs && normalizedSpecs.length > 0 && (
                    <div ref={specsRef} className="mt-10 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                            <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-lg text-indigo-600 dark:text-indigo-400"><Cpu size={24} /></div>
                            Teknik Özellikler
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {normalizedSpecs.map((spec, i) => (
                                <div key={i} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-start gap-4">
                                    <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl text-slate-600 dark:text-slate-400">
                                        {spec.icon || <Cpu size={24} />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white mb-1">{spec.label}</h4>
                                        <p className="text-slate-600 dark:text-slate-400 text-sm">{spec.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-slate-400 dark:text-slate-600 mt-4 text-center">
                            * Veriler GSM Arena üzerinden otomatik çekilmiştir. ({specs.name || displayProduct.name})
                        </p>
                    </div>
                )}

                <div className="mb-10" ref={reviewRef}>
                    <ReviewSummary productName={displayProduct.name} trigger={triggerReview} onTrigger={() => setTriggerReview(true)} />
                </div>

            </div>
            <ComparisonBar />
        </div >
    );
}
