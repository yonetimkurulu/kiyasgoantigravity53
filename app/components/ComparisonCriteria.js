'use client';

import React, { useState } from 'react';
import {
    Camera, Zap, Battery, Monitor, Volume2, CreditCard, Check, SlidersHorizontal,
    Video, BatteryCharging, Aperture, Smartphone, Cpu, Wind, HardDrive, Gamepad2,
    Layers, Headphones, Watch, Tablet, Droplets, Utensils, Snowflake, Armchair,
    Shirt, Footprints, Ruler, Wifi, Activity, Sparkles, Anchor
} from 'lucide-react';

// Icon component helper for missing ones - DEFINED BEFORE USAGE
const MapPinIcon = ({ size }) => <span style={{ fontSize: size }}>📍</span>;

const CATEGORY_CONFIGS = {
    // ---------------- ELEKTRONİK ----------------

    // TELEFONLAR
    'phones': {
        initialWeights: {
            camera_photo: 3, screen: 3, performance: 3, battery_life: 3, price: 3
        },
        criteria: [
            { key: 'camera_photo', label: 'Kamera Kalitesi', icon: <Aperture size={20} />, activeColor: 'bg-rose-500' },
            { key: 'screen', label: 'Ekran Kalitesi', icon: <Monitor size={20} />, activeColor: 'bg-blue-500' },
            { key: 'performance', label: 'İşlemci Gücü', icon: <Cpu size={20} />, activeColor: 'bg-violet-500' },
            { key: 'battery_life', label: 'Pil Ömrü', icon: <Battery size={20} />, activeColor: 'bg-green-500' },
            { key: 'storage', label: 'Depolama', icon: <HardDrive size={20} />, activeColor: 'bg-indigo-500' },
            { key: 'price', label: 'Fiyat', icon: <CreditCard size={20} />, activeColor: 'bg-amber-500' },
        ]
    },

    // LAPTOPLAR
    'laptops': {
        initialWeights: {
            performance: 3, gaming: 1, screen: 3, portable: 3, price: 3
        },
        criteria: [
            { key: 'performance', label: 'Performans', icon: <Cpu size={20} />, activeColor: 'bg-violet-500' },
            { key: 'gaming', label: 'Oyun Performansı', icon: <Gamepad2 size={20} />, activeColor: 'bg-purple-500' },
            { key: 'screen', label: 'Ekran', icon: <Monitor size={20} />, activeColor: 'bg-blue-500' },
            { key: 'portable', label: 'Taşınabilirlik', icon: <Layers size={20} />, activeColor: 'bg-orange-500' },
            { key: 'battery', label: 'Pil Ömrü', icon: <Battery size={20} />, activeColor: 'bg-green-500' },
            { key: 'price', label: 'Fiyat', icon: <CreditCard size={20} />, activeColor: 'bg-amber-500' },
        ]
    },

    // TABLETLER
    'tablets': {
        initialWeights: {
            screen: 3, performance: 3, battery: 3, pen_support: 2, price: 3
        },
        criteria: [
            { key: 'screen', label: 'Ekran Deneyimi', icon: <Tablet size={20} />, activeColor: 'bg-blue-500' },
            { key: 'performance', label: 'Hız / Çip', icon: <Cpu size={20} />, activeColor: 'bg-violet-500' },
            { key: 'battery', label: 'Pil Ömrü', icon: <Battery size={20} />, activeColor: 'bg-green-500' },
            { key: 'pen_support', label: 'Kalem Desteği', icon: <Sparkles size={20} />, activeColor: 'bg-pink-500' },
            { key: 'camera', label: 'Kamera', icon: <Camera size={20} />, activeColor: 'bg-rose-500' },
            { key: 'price', label: 'Fiyat', icon: <CreditCard size={20} />, activeColor: 'bg-amber-500' },
        ]
    },

    // KULAKLIKLAR
    'headphones': {
        initialWeights: {
            sound_quality: 3, anc: 3, comfort: 3, battery: 3, mic: 2
        },
        criteria: [
            { key: 'sound_quality', label: 'Ses Kalitesi', icon: <Volume2 size={20} />, activeColor: 'bg-indigo-500' },
            { key: 'anc', label: 'Gürültü Engelleme', icon: <Activity size={20} />, activeColor: 'bg-blue-500' },
            { key: 'comfort', label: 'Konfor', icon: <Layers size={20} />, activeColor: 'bg-orange-500' },
            { key: 'battery', label: 'Pil Ömrü', icon: <Battery size={20} />, activeColor: 'bg-green-500' },
            { key: 'mic', label: 'Mikrofon', icon: <Video size={20} />, activeColor: 'bg-red-500' },
            { key: 'price', label: 'Fiyat', icon: <CreditCard size={20} />, activeColor: 'bg-amber-500' },
        ]
    },

    // AKILLI SAATLER
    'smartwatches': {
        initialWeights: {
            health_sensors: 3, battery: 3, screen: 3, style: 2, price: 3
        },
        criteria: [
            { key: 'health_sensors', label: 'Sağlık Sensörleri', icon: <Activity size={20} />, activeColor: 'bg-rose-500' },
            { key: 'battery', label: 'Pil Ömrü', icon: <Battery size={20} />, activeColor: 'bg-green-500' },
            { key: 'screen', label: 'Ekran', icon: <Monitor size={20} />, activeColor: 'bg-blue-500' },
            { key: 'style', label: 'Tasarım', icon: <Sparkles size={20} />, activeColor: 'bg-purple-500' },
            { key: 'gps', label: 'GPS / Spor', icon: <MapPinIcon size={20} />, activeColor: 'bg-emerald-500' },
            { key: 'price', label: 'Fiyat', icon: <CreditCard size={20} />, activeColor: 'bg-amber-500' },
        ]
    },

    // TELEVİZYONLAR
    'televisions': {
        initialWeights: {
            screen_quality: 3, sound: 3, smart_features: 3, refresh_rate: 3, price: 3
        },
        criteria: [
            { key: 'screen_quality', label: 'Görüntü Kalitesi', icon: <Monitor size={20} />, activeColor: 'bg-blue-500' },
            { key: 'sound', label: 'Ses Sistemi', icon: <Volume2 size={20} />, activeColor: 'bg-indigo-500' },
            { key: 'smart_features', label: 'Smart TV / Yazılım', icon: <Cpu size={20} />, activeColor: 'bg-violet-500' },
            { key: 'refresh_rate', label: 'Yenileme Hızı (Hz)', icon: <Zap size={20} />, activeColor: 'bg-amber-500' },
            { key: 'price', label: 'Fiyat', icon: <CreditCard size={20} />, activeColor: 'bg-emerald-500' },
        ]
    },

    // ---------------- EV / YAŞAM ----------------

    // ROBOT SÜPÜRGELER
    'cleaners': {
        initialWeights: {
            suction: 3, mopping: 3, navigation: 3, battery: 3, price: 3
        },
        criteria: [
            { key: 'suction', label: 'Çekim Gücü', icon: <Wind size={20} />, activeColor: 'bg-cyan-500' },
            { key: 'mopping', label: 'Mop / Silme', icon: <Layers size={20} />, activeColor: 'bg-blue-500' },
            { key: 'navigation', label: 'Haritalama', icon: <Cpu size={20} />, activeColor: 'bg-violet-500' },
            { key: 'battery', label: 'Pil & Şarj', icon: <Battery size={20} />, activeColor: 'bg-green-500' },
            { key: 'price', label: 'Fiyat', icon: <CreditCard size={20} />, activeColor: 'bg-amber-500' },
        ]
    },

    // ÇAMAŞIR MAKİNESİ
    'washing_machines': {
        initialWeights: {
            capacity: 3, energy: 3, noise: 2, programs: 3, price: 3
        },
        criteria: [
            { key: 'capacity', label: 'Kapasite (kg)', icon: <Layers size={20} />, activeColor: 'bg-blue-500' },
            { key: 'energy', label: 'Enerji Sınıfı', icon: <Zap size={20} />, activeColor: 'bg-green-500' },
            { key: 'noise', label: 'Sessizlik', icon: <Volume2 size={20} />, activeColor: 'bg-indigo-300' },
            { key: 'programs', label: 'Program Çeşitliliği', icon: <SlidersHorizontal size={20} />, activeColor: 'bg-violet-500' },
            { key: 'price', label: 'Fiyat', icon: <CreditCard size={20} />, activeColor: 'bg-amber-500' },
        ]
    },

    // BUZDOLABI
    'fridges': {
        initialWeights: {
            volume: 3, energy: 3, cooling: 3, design: 2, price: 3
        },
        criteria: [
            { key: 'volume', label: 'İç Hacim', icon: <Layers size={20} />, activeColor: 'bg-blue-500' },
            { key: 'energy', label: 'Enerji Tüketimi', icon: <Zap size={20} />, activeColor: 'bg-green-500' },
            { key: 'cooling', label: 'Soğutma Teknolojisi', icon: <Snowflake size={20} />, activeColor: 'bg-cyan-500' },
            { key: 'design', label: 'Tasarım', icon: <Sparkles size={20} />, activeColor: 'bg-slate-500' },
            { key: 'price', label: 'Fiyat', icon: <CreditCard size={20} />, activeColor: 'bg-amber-500' },
        ]
    },

    // ---------------- MODA / AYAKKABI ----------------
    'shoes': {
        initialWeights: {
            comfort: 3, durability: 3, style: 3, material: 2, price: 3
        },
        criteria: [
            { key: 'comfort', label: 'Konfor / Rahatlık', icon: <Footprints size={20} />, activeColor: 'bg-orange-400' },
            { key: 'durability', label: 'Dayanıklılık', icon: <Anchor size={20} />, activeColor: 'bg-slate-500' },
            { key: 'style', label: 'Tarz / Görünüm', icon: <Sparkles size={20} />, activeColor: 'bg-pink-500' },
            { key: 'material', label: 'Malzeme Kalitesi', icon: <Layers size={20} />, activeColor: 'bg-emerald-600' },
            { key: 'price', label: 'Fiyat', icon: <CreditCard size={20} />, activeColor: 'bg-amber-500' },
        ]
    },

    // VARSAYILAN
    'default': {
        initialWeights: {
            performance: 3, features: 3, build_quality: 3, user_score: 3, price: 3
        },
        criteria: [
            { key: 'performance', label: 'Performans / İşlev', icon: <Zap size={20} />, activeColor: 'bg-violet-500' },
            { key: 'features', label: 'Özellikler', icon: <Layers size={20} />, activeColor: 'bg-blue-500' },
            { key: 'build_quality', label: 'Malzeme Kalitesi', icon: <Check size={20} />, activeColor: 'bg-indigo-500' },
            { key: 'user_score', label: 'Kullanıcı Yorumları', icon: <Smartphone size={20} />, activeColor: 'bg-rose-500' },
            { key: 'price', label: 'Fiyat', icon: <CreditCard size={20} />, activeColor: 'bg-amber-500' },
        ]
    }
};

export default function ComparisonCriteria({ onGenerate, category = 'default' }) {
    // Kategori eşleştirme
    let configKey = 'default';
    const lowerCat = String(category).toLowerCase();

    if (lowerCat.includes('telefon') || lowerCat.includes('phone') || lowerCat.includes('cep')) configKey = 'phones';
    else if (lowerCat.includes('laptop') || lowerCat.includes('bilgisayar') || lowerCat.includes('notebook') || lowerCat.includes('pc')) configKey = 'laptops';
    else if (lowerCat.includes('süpürge') || lowerCat.includes('cleaner') || lowerCat.includes('robot')) configKey = 'cleaners';
    else if (lowerCat.includes('televizyon') || lowerCat.includes('tv')) configKey = 'televisions';
    else if (lowerCat.includes('kulaklık') || lowerCat.includes('headphone') || lowerCat.includes('airpods')) configKey = 'headphones';
    else if (lowerCat.includes('saat') || lowerCat.includes('watch')) configKey = 'smartwatches';
    else if (lowerCat.includes('tablet') || lowerCat.includes('ipad')) configKey = 'tablets';
    else if (lowerCat.includes('çamaşır') || lowerCat.includes('washing')) configKey = 'washing_machines';
    else if (lowerCat.includes('bulaşık')) configKey = 'washing_machines'; // share similar criteria for now if needed, or make separate
    else if (lowerCat.includes('buzdolabı') || lowerCat.includes('fridge')) configKey = 'fridges';
    else if (lowerCat.includes('ayakkabı') || lowerCat.includes('shoe') || lowerCat.includes('sneaker')) configKey = 'shoes';

    const config = CATEGORY_CONFIGS[configKey];

    // Varsayılan state'i başlat (Config değişirse bu hook çalışmaz, key prop şart)
    const [weights, setWeights] = useState(config.initialWeights);
    // Varsayılan olarak ilk 3-4 kriter seçili gelsin
    const [activeKeys, setActiveKeys] = useState(Object.keys(config.initialWeights).slice(0, 3));

    const handleWeightChange = (key, value) => {
        setWeights(prev => ({ ...prev, [key]: parseInt(value) }));
    };

    const toggleCriteria = (key) => {
        if (activeKeys.includes(key)) {
            setActiveKeys(prev => prev.filter(k => k !== key));
        } else {
            setActiveKeys(prev => [...prev, key]);
        }
    };

    const handleGenerateClick = () => {
        const activeWeights = {};
        activeKeys.forEach(k => {
            activeWeights[k] = weights[k];
        });
        onGenerate(activeWeights);
    };

    const getLabel = (val) => {
        if (val === 1) return 'Önemsiz';
        if (val === 2) return 'Az Önemli';
        if (val === 3) return 'Orta';
        if (val === 4) return 'Önemli';
        if (val === 5) return 'Çok Önemli';
        return '';
    };

    const availableCriteria = config.criteria.filter(c => !activeKeys.includes(c.key));
    const activeCriteria = config.criteria.filter(c => activeKeys.includes(c.key));

    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-indigo-100/50 dark:shadow-none border border-slate-200 dark:border-slate-800 p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500" key={configKey}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4">
                    <div className="bg-indigo-100 dark:bg-indigo-900/40 p-3 rounded-2xl text-indigo-600 dark:text-indigo-400">
                        <SlidersHorizontal size={28} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Kriterlerini Belirle</h2>
                        <p className="text-slate-500 dark:text-slate-400">
                            {configKey === 'default'
                                ? 'Bu kategori için genel kriterleri puanla.'
                                : `Senin için önemli olan özellikleri seç.`}
                        </p>
                    </div>
                </div>
            </div>

            {/* Seçili Kriterler Listesi (Adaptive Grid) */}
            <div className={`mb-8 ${activeCriteria.length > 5 ? 'grid md:grid-cols-2 gap-4' : 'space-y-4'}`}>
                {activeCriteria.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 col-span-full">
                        Henüz bir kriter seçmedin. Aşağıdan özellik ekle.
                    </div>
                )}

                {activeCriteria.map((c) => (
                    <div key={c.key} className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors group">
                        <div className={`p-2 rounded-lg text-white ${c.activeColor} shadow-sm hidden sm:block`}>
                            {c.icon}
                        </div>

                        <div className="w-32 md:w-48 font-bold text-slate-700 dark:text-slate-200 text-sm md:text-base truncate" title={c.label}>
                            {c.label}
                        </div>

                        <div className="flex-1 flex items-center gap-4">
                            <input
                                type="range"
                                min="1"
                                max="5"
                                step="1"
                                value={weights[c.key]}
                                onChange={(e) => handleWeightChange(c.key, e.target.value)}
                                className={`w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-500`}
                            />
                            <span className="w-24 text-right text-xs font-bold text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0">
                                {getLabel(weights[c.key])}
                            </span>
                        </div>

                        <button
                            onClick={() => toggleCriteria(c.key)}
                            className="p-2 text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                            title="Çıkar"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </button>
                    </div>
                ))}
            </div>

            {/* Eklenebilir Kriterler (Chips) */}
            {availableCriteria.length > 0 && (
                <div className="mb-8">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">DAHA FAZLA KRİTER EKLE</p>
                    <div className="flex flex-wrap gap-3">
                        {availableCriteria.map((c) => (
                            <button
                                key={c.key}
                                onClick={() => toggleCriteria(c.key)}
                                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-slate-600 dark:text-slate-400 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all font-medium text-sm shadow-sm"
                            >
                                <span className="opacity-50">{c.icon}</span>
                                {c.label}
                                <span className="text-indigo-500 ml-1 font-bold">+</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                    onClick={handleGenerateClick}
                    disabled={activeCriteria.length === 0}
                    className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 dark:shadow-none hover:shadow-xl hover:-translate-y-1 transition-all flex items-center gap-3 w-full md:w-auto justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Check size={24} strokeWidth={3} />
                    Analizi Başlat
                </button>
            </div>
        </div>
    );
}
