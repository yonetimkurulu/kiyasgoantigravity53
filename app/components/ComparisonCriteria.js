'use client';

import React, { useState } from 'react';
import { Camera, Zap, Battery, Monitor, Volume2, CreditCard, Check, SlidersHorizontal, Video, BatteryCharging, Aperture, Smartphone, Cpu, Wind, HardDrive, Gamepad2, Layers } from 'lucide-react';

const CATEGORY_CONFIGS = {
    // TELEFONLAR
    'phones': {
        initialWeights: {
            camera_photo: 3, camera_video: 3, selfie_photo: 3, selfie_video: 3,
            screen: 3, performance: 3, battery_life: 3, charging: 3, audio: 1, price: 3
        },
        criteria: [
            { key: 'camera_photo', label: 'Arka Kamera (Fotoğraf)', icon: <Aperture size={20} />, activeColor: 'bg-rose-500' },
            { key: 'camera_video', label: 'Arka Kamera (Video)', icon: <Video size={20} />, activeColor: 'bg-rose-600' },
            { key: 'selfie_photo', label: 'Ön Kamera (Fotoğraf)', icon: <Camera size={20} />, activeColor: 'bg-pink-500' },
            { key: 'selfie_video', label: 'Ön Kamera (Video)', icon: <Smartphone size={20} />, activeColor: 'bg-pink-600' },
            { key: 'screen', label: 'Ekran', icon: <Monitor size={20} />, activeColor: 'bg-blue-500' },
            { key: 'performance', label: 'Performans', icon: <Cpu size={20} />, activeColor: 'bg-violet-500' },
            { key: 'battery_life', label: 'Pil Ömrü', icon: <Battery size={20} />, activeColor: 'bg-green-500' },
            { key: 'charging', label: 'Şarj Hızı', icon: <BatteryCharging size={20} />, activeColor: 'bg-green-600' },
            { key: 'audio', label: 'Ses / Hoparlör', icon: <Volume2 size={20} />, activeColor: 'bg-indigo-500' },
            { key: 'price', label: 'Fiyat', icon: <CreditCard size={20} />, activeColor: 'bg-amber-500' },
        ]
    },

    // LAPTOPLAR
    'laptops': {
        initialWeights: {
            performance: 3, gaming: 1, screen: 3, battery: 3, portability: 3, price: 3
        },
        criteria: [
            { key: 'performance', label: 'İşlemci & Performans', icon: <Cpu size={20} />, activeColor: 'bg-violet-500' },
            { key: 'gaming', label: 'Oyun / Grafik', icon: <Gamepad2 size={20} />, activeColor: 'bg-purple-500' },
            { key: 'screen', label: 'Ekran Kalitesi', icon: <Monitor size={20} />, activeColor: 'bg-blue-500' },
            { key: 'battery', label: 'Pil Ömrü', icon: <Battery size={20} />, activeColor: 'bg-green-500' },
            { key: 'portability', label: 'Taşınabilirlik', icon: <Layers size={20} />, activeColor: 'bg-orange-500' },
            { key: 'price', label: 'Fiyat', icon: <CreditCard size={20} />, activeColor: 'bg-amber-500' },
        ]
    },

    // ROBOT SÜPÜRGELER
    'cleaners': {
        initialWeights: {
            suction: 3, mopping: 3, navigation: 3, battery: 3, price: 3
        },
        criteria: [
            { key: 'suction', label: 'Çekim Gücü', icon: <Wind size={20} />, activeColor: 'bg-cyan-500' },
            { key: 'mopping', label: 'Mop / Silme', icon: <Layers size={20} />, activeColor: 'bg-blue-500' },
            { key: 'navigation', label: 'Akıllı Haritalama', icon: <Cpu size={20} />, activeColor: 'bg-violet-500' },
            { key: 'battery', label: 'Pil & Şarj', icon: <Battery size={20} />, activeColor: 'bg-green-500' },
            { key: 'price', label: 'Fiyat', icon: <CreditCard size={20} />, activeColor: 'bg-amber-500' },
        ]
    },

    // VARSAYILAN
    'default': {
        initialWeights: {
            performance: 3, features: 3, build_quality: 3, battery: 3, price: 3
        },
        criteria: [
            { key: 'performance', label: 'Performans', icon: <Zap size={20} />, activeColor: 'bg-violet-500' },
            { key: 'features', label: 'Özellikler', icon: <Layers size={20} />, activeColor: 'bg-blue-500' },
            { key: 'build_quality', label: 'Malzeme Kalitesi', icon: <Check size={20} />, activeColor: 'bg-indigo-500' },
            { key: 'battery', label: 'Kullanım Süresi', icon: <Battery size={20} />, activeColor: 'bg-green-500' },
            { key: 'price', label: 'Fiyat', icon: <CreditCard size={20} />, activeColor: 'bg-amber-500' },
        ]
    }
};

export default function ComparisonCriteria({ onGenerate, category = 'phones' }) {
    // Kategori eşleştirme
    let configKey = 'default';
    const lowerCat = category?.toLowerCase() || '';

    if (lowerCat.includes('telefon') || lowerCat.includes('phone') || lowerCat.includes('cep')) configKey = 'phones';
    else if (lowerCat.includes('laptop') || lowerCat.includes('bilgisayar') || lowerCat.includes('notebook')) configKey = 'laptops';
    else if (lowerCat.includes('süpürge') || lowerCat.includes('cleaner') || lowerCat.includes('robot')) configKey = 'cleaners';

    const config = CATEGORY_CONFIGS[configKey];

    const [weights, setWeights] = useState(config.initialWeights);
    // Varsayılan olarak ilk 3 kriter seçili gelsin
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
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-indigo-100/50 dark:shadow-none border border-slate-200 dark:border-slate-800 p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4">
                    <div className="bg-indigo-100 dark:bg-indigo-900/40 p-3 rounded-2xl text-indigo-600 dark:text-indigo-400">
                        <SlidersHorizontal size={28} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Kriterlerini Belirle</h2>
                        <p className="text-slate-500 dark:text-slate-400">Sadece senin için önemli olan özellikleri seç.</p>
                    </div>
                </div>
            </div>

            {/* Seçili Kriterler Listesi (Compact) */}
            <div className="space-y-4 mb-8">
                {activeCriteria.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400">
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
