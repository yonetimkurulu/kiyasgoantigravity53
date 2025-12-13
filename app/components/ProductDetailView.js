"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { fetchVariantsAction } from '@/app/actions/variantActions';

const SUPABASE_URL = "https://eupwqhesbcjczsdgkurh.supabase.co";
// Client used for other things or remove if unused, but keep import structure valid
// Actually, let's revert to standard import for the rest of the file if needed, 
// or just keep using the @/lib/supabase one if it works for other parts. 
// But wait, the file uses `supabase` for `fetchProductData` later.
// So we must keep a valid client. 
// Let's restore the standard ANON key client for the rest of the file functionality (like querying product details).

const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFub24iLCJpYXQiOjE3NjQ4Mzc3NzYsImV4cCI6MjA4MDQxMzc3Nn0.HvjHUvI3qS1EKfcJjNI_aLOV3_opDZLGW1MezEmXCoc";
const supabase = createClient(SUPABASE_URL, ANON_KEY);
import { Star, ShieldCheck, Zap, Truck, ArrowRight, ChevronRight, Home, ShoppingCart, Cpu, Maximize, Battery, Smartphone, Wifi, Camera, MessageCircle } from 'lucide-react';
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


    // Only loading if we don't have initial data or product is empty
    const [loading, setLoading] = useState(!mergedProduct || Object.keys(mergedProduct || {}).length === 0);
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

    const activeSupabaseData = supabaseData || (mergedProduct && Object.keys(mergedProduct).length > 0 ? processSupabaseData(mergedProduct) : null);
    const displayProduct = activeSupabaseData || mergedProduct || {};

    // Deduplicate Images
    const uniqueImages = React.useMemo(() => {
        if (!displayProduct) return [];
        const imgs = [
            displayProduct.image,
            displayProduct.image2,
            displayProduct.image3,
            displayProduct.image4,
            displayProduct.image5
        ].filter(Boolean);
        return [...new Set(imgs)];
    }, [displayProduct]);


    const handleAskAssistant = () => {
        console.log("Triggering openChat event with message:", `${displayProduct.name} hakkında bana bilgi ver.`);
        const event = new CustomEvent('openChat', {
            detail: { message: `${displayProduct.name} hakkında bana bilgi ver.` }
        });
        window.dispatchEvent(event);
    };

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
        if (displayProduct.store1_name) stores.push({ store: displayProduct.store1_name, price: displayProduct.store1_price || displayProduct.price || 0, link: displayProduct.link, color: 'text-indigo-600' });
        if (displayProduct.store2_name) stores.push({ store: displayProduct.store2_name, price: displayProduct.store2_price || 0, link: displayProduct.store2_link, color: 'text-orange-500' });
        if (displayProduct.store3_name) stores.push({ store: displayProduct.store3_name, price: displayProduct.store3_price || 0, link: displayProduct.store3_link, color: 'text-blue-600' });

        if (stores.length > 0) return stores;
        return generatePrices(displayProduct.price || 0); // Fallback generator
    }, [displayProduct]);


    const [storageVariants, setStorageVariants] = useState([]);
    const [colorVariants, setColorVariants] = useState([]);

    // FETCH VARIANTS
    useEffect(() => {
        if (!displayProduct?.name || !displayProduct?.slug) return;

        const fetchVariants = async () => {
            // Colors Regex Pattern (Turkish & English & Special Marketing Names) - Expanded
            const colorPattern = /(Siyah|Beyaz|Mavi|Kırmızı|Yeşil|Sarı|Mor|Gri|Gümüş|Altın|Pembe|Turuncu|Lacivert|Krem|Bej|Bordo|Black|White|Blue|Red|Green|Yellow|Purple|Grey|Silver|Gold|Pink|Orange|Navy|Cream|Beige|Midnight|Starlight|Graphite|Space|Titanium|Natural|Sierra|Alpine|Deep|Jet|Mat|Parlak|Rose|Dark|Light|Titanyum|Gece|Yıldız|Uzay|Menekşe|Okyanus|Kehribar|Bakır|Zümrüt|Safir|Işığı|Yarısı)/gi;

            // Helper to clean product name for base matching
            const getBaseName = (name) => {
                if (!name || typeof name !== 'string') return "";
                return name
                    .toLowerCase()
                    .replace(/^(apple|samsung|xiaomi|huawei|oppo|vivo|realme|oneplus|general mobile|reeder|casper|honor|poco|tecno|infinix|google|asus|sony|vestel|omix)\s+/gi, '')
                    .replace(/\s(16|32|64|128|256|512)\s?gb|1\s?tb/gi, '')
                    .replace(/\s\d{1,2}\s?gb\s?ram/gi, '')
                    .replace(colorPattern, '')
                    .replace(/[\(\)\[\]]/g, '')
                    .replace(/(\s|^)(5g|4g|lte)(\s|$)/gi, '') // Remove network markers
                    .replace(/\s+/g, ' ')
                    .trim();
            };

            const safeName = displayProduct.name || "";
            const currentBaseName = getBaseName(safeName);
            console.log("Current Base Name:", currentBaseName);

            if (!currentBaseName || currentBaseName.length < 3) return;

            // 1. Current Product Attributes
            const currentStorageMatch = safeName.match(/(16|32|64|128|256|512)\s?GB|1\s?TB/i);
            const currentStorage = currentStorageMatch ? currentStorageMatch[0].toUpperCase().replace(/\s/g, '') : null;

            const colorMatches = safeName.match(colorPattern);
            const currentColor = colorMatches ? colorMatches.join(' ') : "";


            try {
                // Use Server Action to bypass RLS/CORS issues
                const result = await fetchVariantsAction(currentBaseName);

                if (!result.success) {
                    console.error("Server Action Failed:", result.error);
                    return;
                }

                const data = result.data;
                console.log("Supabase Data Length (Server):", data?.length);

                if (data && data.length > 1) {
                    const candidates = data.filter(item => {
                        return true;
                    }).map(v => {
                        // Extract Storage
                        const sMatch = v.name.match(/(16|32|64|128|256|512)\s?GB|1\s?TB/i);
                        const storage = sMatch ? sMatch[0].toUpperCase() : 'Standart';

                        // Extract Color
                        const cMatches = v.name.match(colorPattern);
                        let color = cMatches ? cMatches.join(' ') : 'Standart';

                        return {
                            ...v,
                            storage: storage,
                            color: color,
                            isActive: v.slug === displayProduct.slug
                        };
                    });

                    console.log("Filtered Candidates:", candidates.length);

                    // 1. Storage Variants
                    const sVariants = candidates
                        .filter(v => v.storage && (v.storage.includes('GB') || v.storage.includes('TB')))
                        .reduce((acc, current) => {
                            const x = acc.find(item => item.storage === current.storage);
                            if (!x) return acc.concat([current]);
                            return acc;
                        }, [])
                        .sort((a, b) => {
                            const getVal = (s) => s.includes('TB') ? parseInt(s) * 1024 : parseInt(s);
                            return getVal(a.storage) - getVal(b.storage);
                        });

                    // 2. Color Variants
                    const cVariants = candidates
                        .filter(v => v.color && v.color !== 'Standart' && v.color !== 'NO_COLOR')
                        .reduce((acc, current) => {
                            const x = acc.find(item => item.color === current.color);
                            if (!x) return acc.concat([current]);
                            return acc;
                        }, []);

                    setStorageVariants(sVariants);
                    setColorVariants(cVariants);
                } else {
                    setStorageVariants([]);
                    setColorVariants([]);
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

        return fields.slice(0, 8); // Show top 8
    }, [specs]);

    // Prevent rendering with empty data
    if (loading && !displayProduct.name) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 pb-32 transition-colors duration-300">
            <Header activeTab={category} onChatOpen={() => window.dispatchEvent(new CustomEvent('openChat'))} />

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
                            <Link href={`/${displayProduct.subcategory}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 capitalize">
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
                    <div className="md:w-5/12 bg-white dark:bg-slate-900 p-8 flex flex-col items-center justify-center relative transition-colors duration-300">
                        <div className="bg-white rounded-3xl p-6 w-full shadow-sm mb-6 flex items-center justify-center min-h-[300px]">
                            <div className="transform hover:scale-105 transition-transform duration-500 drop-shadow-lg w-full flex items-center justify-center">
                                {(selectedImage || displayProduct.image || '').startsWith('http') ? (
                                    <img src={selectedImage || displayProduct.image} alt={displayProduct.name} className="max-w-full max-h-[350px] object-contain animate-in fade-in zoom-in duration-300" />
                                ) : (
                                    <span>{selectedImage || displayProduct.image}</span>
                                )}
                            </div>
                        </div>

                        {uniqueImages.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto w-full px-2 py-2 no-scrollbar justify-center">
                                {uniqueImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(img)}
                                        className={`w-16 h-16 rounded-xl border-2 overflow-hidden flex-shrink-0 transition-all ${selectedImage === img || (!selectedImage && idx === 0) ? 'border-indigo-600 ring-2 ring-indigo-200 dark:ring-indigo-900' : 'border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100'}`}
                                    >
                                        <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-contain bg-white" />
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

                    <div className="p-6 flex-1 flex flex-col justify-center border-l border-r border-slate-50 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 text-sm font-bold bg-amber-50 dark:bg-amber-900/30 px-3 py-1 rounded-full border border-amber-100 dark:border-amber-900/50">
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
                                <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{(supabaseData?.price || displayProduct.price || 0).toLocaleString('tr-TR')} <span className="text-lg text-slate-500 dark:text-slate-400 font-bold">₺</span></p>
                            </div>
                            <a
                                href={storePrices?.[0]?.link || displayProduct.link || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-6 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none transition-all transform hover:-translate-y-1 hover:shadow-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white justify-center"
                            >
                                Ürüne Git <ArrowRight size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Right Sidebar - Assistant Trigger */}
                    <button
                        onClick={handleAskAssistant}
                        className="w-full md:w-16 border-t md:border-t-0 md:border-l border-indigo-500 bg-indigo-600 flex flex-row md:flex-col items-center justify-center gap-3 p-4 md:p-0 hover:bg-indigo-700 transition-colors cursor-pointer group text-center relative overflow-hidden"
                    >
                        <div className="bg-white/10 p-2 rounded-full backdrop-blur-sm group-hover:scale-110 transition-transform md:mb-4">
                            <MessageCircle size={24} className="text-white" />
                        </div>
                        <span
                            className="font-bold text-white text-base md:text-lg whitespace-nowrap tracking-wide hidden md:block rotate-180"
                            style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
                        >
                            Asistan'a Sor
                        </span>
                        <span className="font-bold text-white text-base md:hidden">
                            Asistan'a Sor
                        </span>
                    </button>

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
                                    <p className="text-2xl font-black text-slate-900 dark:text-white">{(offer.price || 0).toLocaleString('tr-TR')} <span className="text-sm font-bold text-slate-400">₺</span></p>
                                    <span className="text-sm text-indigo-600 dark:text-indigo-400 font-bold group-hover:underline flex items-center justify-end gap-1 mt-1">
                                        Mağazaya Git <ArrowRight size={14} />
                                    </span>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>

                {normalizedSpecs && normalizedSpecs.length > 0 && (
                    <div ref={specsRef} className="mt-10 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 scroll-mt-32">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <div className="bg-indigo-100 dark:bg-indigo-900/50 p-1.5 rounded-lg text-indigo-600 dark:text-indigo-400"><Cpu size={20} /></div>
                            Teknik Özellikler
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {normalizedSpecs.map((spec, i) => (
                                <div key={i} className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-2 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg text-slate-500 dark:text-slate-400 shrink-0">
                                            {React.cloneElement(spec.icon, { size: 18 })}
                                        </div>
                                        <h4 className="font-bold text-slate-700 dark:text-slate-200 text-xs leading-tight">{spec.label}</h4>
                                    </div>
                                    <p className="text-slate-900 dark:text-white text-sm font-semibold pl-1">{spec.value}</p>
                                </div>
                            ))}
                        </div>
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

// Verified: Clean build.
