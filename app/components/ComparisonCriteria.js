'use client';

import React, { useState } from 'react';
import { Camera, Zap, Battery, Monitor, Volume2, CreditCard, Check, SlidersHorizontal, Video, BatteryCharging, Aperture, Smartphone, Cpu } from 'lucide-react';

export default function ComparisonCriteria({ onGenerate }) {
    const [weights, setWeights] = useState({
        camera_photo: 3,
        camera_video: 3,
        selfie_photo: 3,
        selfie_video: 3,
        screen: 3,
        performance: 3,
        battery_life: 3,
        charging: 3,
        audio: 1,
        price: 3
    });

    const handleWeightChange = (key, value) => {
        setWeights(prev => ({ ...prev, [key]: parseInt(value) }));
    };

    const criteria = [
        // Arka Kamera
        { key: 'camera_photo', label: 'Arka Kamera (Fotoğraf)', icon: <Aperture size={20} />, activeColor: 'bg-rose-500' },
        { key: 'camera_video', label: 'Arka Kamera (Video)', icon: <Video size={20} />, activeColor: 'bg-rose-600' },

        // Ön Kamera
        { key: 'selfie_photo', label: 'Ön Kamera (Fotoğraf)', icon: <Camera size={20} />, activeColor: 'bg-pink-500' },
        { key: 'selfie_video', label: 'Ön Kamera (Video)', icon: <Smartphone size={20} />, activeColor: 'bg-pink-600' },

        // Ekran & Performans
        { key: 'screen', label: 'Ekran', icon: <Monitor size={20} />, activeColor: 'bg-blue-500' },
        { key: 'performance', label: 'Performans', icon: <Cpu size={20} />, activeColor: 'bg-violet-500' },

        // Batarya
        { key: 'battery_life', label: 'Pil Ömrü', icon: <Battery size={20} />, activeColor: 'bg-green-500' },
        { key: 'charging', label: 'Şarj Hızı', icon: <BatteryCharging size={20} />, activeColor: 'bg-green-600' },

        // Diğer
        { key: 'audio', label: 'Ses / Hoparlör', icon: <Volume2 size={20} />, activeColor: 'bg-indigo-500' },
        { key: 'price', label: 'Fiyat', icon: <CreditCard size={20} />, activeColor: 'bg-amber-500' },
    ];

    const getLabel = (val) => {
        if (val === 1) return 'Önemsiz';
        if (val === 2) return 'Az Önemli';
        if (val === 3) return 'Orta';
        if (val === 4) return 'Önemli';
        if (val === 5) return 'Çok Önemli';
        return '';
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-indigo-100/50 dark:shadow-none border border-slate-200 dark:border-slate-800 p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="bg-indigo-100 dark:bg-indigo-900/40 p-3 rounded-2xl text-indigo-600 dark:text-indigo-400">
                    <SlidersHorizontal size={28} />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">Kriterlerini Belirle</h2>
                    <p className="text-slate-500 dark:text-slate-400">Yapay zeka hangi özelliklere daha çok dikkat etmeli?</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
                {criteria.map((c) => (
                    <div key={c.key} className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors group">
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`p-2 rounded-lg text-white ${c.activeColor} shadow-sm group-hover:scale-110 transition-transform`}>
                                {c.icon}
                            </div>
                            <h3 className="font-bold text-slate-700 dark:text-slate-200">{c.label}</h3>
                            <span className="ml-auto text-xs font-bold text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                                {getLabel(weights[c.key])}
                            </span>
                        </div>

                        <input
                            type="range"
                            min="1"
                            max="5"
                            step="1"
                            value={weights[c.key]}
                            onChange={(e) => handleWeightChange(c.key, e.target.value)}
                            className={`w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-500`}
                        />
                        <div className="flex justify-between mt-2 text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                            <span>-</span>
                            <span>+</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-end">
                <button
                    onClick={() => onGenerate(weights)}
                    className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 dark:shadow-none hover:shadow-xl hover:-translate-y-1 transition-all flex items-center gap-3 w-full md:w-auto justify-center"
                >
                    <Check size={24} strokeWidth={3} />
                    Analizi Başlat
                </button>
            </div>
        </div>
    );
}
