'use client';

import React, { useEffect, useState } from 'react';
import { useComparison } from '@/app/context/ComparisonContext';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Zap, Check, X, Loader2, Sparkles, Trophy, Minus, BarChart3, Star } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Header from '@/app/components/Header';
import ComparisonCriteria from '@/app/components/ComparisonCriteria';

export default function ComparisonPage() {
    const { selectedProducts } = useComparison();
    const router = useRouter();
    const [comparisonData, setComparisonData] = useState(null);
    const [step, setStep] = useState('criteria'); // criteria | analyzing | results

    useEffect(() => {
        if (selectedProducts.length === 0) {
            router.push('/');
            return;
        }
    }, [selectedProducts, router]);

    const handleGenerate = async (weights) => {
        setStep('analyzing');

        try {
            // 1. Supabase'den gerçek verileri çek
            const productDetailsForAI = [];

            for (const product of selectedProducts) {
                const { data } = await supabase
                    .from('phones')
                    .select('*')
                    .ilike('name', `%${product.name}%`)
                    .limit(1)
                    .maybeSingle();

                if (data) {
                    productDetailsForAI.push(`
                        Ürün: ${product.name}
                        Fiyat: ${product.price} TL
                        Özellikler (Supabase): ${JSON.stringify(data)}
                    `);
                } else {
                    productDetailsForAI.push(`Ürün: ${product.name}, Fiyat: ${product.price} TL (Veritabanında detay yok, genel bilgini kullan)`);
                }
            }

            // 2. Yapay Zeka Analizi İste
            const criteriaText = Object.entries(weights)
                .map(([k, v]) => `${k.toUpperCase()}: ${v}/5 ÖNEM DERECESİ`)
                .join(', ');

            const prompt = `Aşağıdaki ürünleri detaylıca karşılaştır.
            
            KULLANICI TERCİHLERİ VE PUANLAMA KRİTERLERİ:
            ${criteriaText}
            
            Lütfen bu kriterlerin önem derecesine göre, her ürüne 100 üzerinden bir "UYUMLULUK PUANI" ver. Fiyat/Performans dengesini de gözet.

            ÜRÜNLER:
            ${productDetailsForAI.join('\n-------------------\n')}
            
            Lütfen çıktıyı SADECE aşağıdaki JSON formatında ver. Başka hiçbir metin ekleme.
            
            {
              "scores": [
                { "productName": "Ürün 1 Adı (Tam olarak listedeki gibi)", "score": 95, "reason": "Puanın kısa gerekçesi" },
                { "productName": "Ürün 2 Adı", "score": 88, "reason": "..." }
              ],
              "specs": [
                { "label": "Ekran", "values": ["Ürün 1 Değeri", "Ürün 2 Değeri", "Ürün 3 Değeri"] },
                { "label": "İşlemci", "values": ["...", "...", "..."] },
                { "label": "RAM", "values": ["...", "...", "..."] },
                { "label": "Depolama", "values": ["...", "...", "..."] },
                { "label": "Kamera", "values": ["...", "...", "..."] },
                { "label": "Batarya", "values": ["...", "...", "..."] },
                { "label": "İşletim Sistemi", "values": ["...", "...", "..."] },
                { "label": "Fiyat", "values": ["... TL", "... TL", "... TL"] }
              ],
              "analysis": {
                "differences": "Temel farkları anlatan 1 paragraf.",
                "pros_cons": "Güçlü ve zayıf yönleri anlatan 1 paragraf.",
                "price_performance": "Fiyat performans analizini anlatan 1 paragraf."
              },
              "winner": "Kazanan Ürün Adı"
            }

            ÖNEMLİ KURALLAR:
            1. "specs" dizisi içindeki özellikler (label) ürün kategorisine göre dinamik olsun.
            2. "values" dizisindeki sıralama, yukarıdaki ÜRÜNLER listesindeki sırayla birebir aynı olmalı.
            3. "scores" listesindeki sıralama da aynı olmalı.
            4. "analysis" kısmındaki 3 paragraf, kullanıcıya rehberlik edecek, samimi ve uzman bir dille yazılmalı.
            `;

            const response = await fetch('/api/deepseek', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, type: 'summary' }) // Using 'summary' type for cleaner JSON, though logic adapts
            });

            const data = await response.json();
            let result = data.result || data.text; // Support both fields

            if (result) {
                result = result.replace(/```json/g, '').replace(/```/g, '').trim();
            }

            const aiResult = JSON.parse(result);
            setComparisonData(aiResult);
            setStep('results');

        } catch (error) {
            console.error("Comparison failed:", error);
            // Error handling fallback
            setComparisonData({
                scores: selectedProducts.map(p => ({ productName: p.name, score: 0, reason: "Hata" })),
                specs: [{ label: "Durum", values: selectedProducts.map(() => "Veri Alınamadı") }],
                analysis: { differences: "Hata oluştu.", pros_cons: "-", price_performance: "-" },
                winner: "-"
            });
            setStep('results');
        }
    };

    if (selectedProducts.length === 0) return null;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 pb-32">
            <Header activeTab="" />

            <div className="max-w-7xl mx-auto p-4 md:p-8">
                <Link href="/" className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-8 transition-colors font-medium">
                    <ArrowLeft size={20} /> Geri Dön
                </Link>

                {/* Pre-Header: Show selected products briefly */}
                <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
                    {selectedProducts.map(p => (
                        <div key={p.id} className="bg-white dark:bg-slate-900 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 flex items-center gap-3 shadow-sm min-w-max">
                            <div className="w-8 h-8 relative">
                                {p.image.startsWith('http') ? <img src={p.image} className="object-contain w-full h-full" alt="" /> : <Zap size={16} />}
                            </div>
                            <div>
                                <span className="text-xs font-bold block text-slate-900 dark:text-slate-200">{p.name}</span>
                                <span className="text-[10px] text-slate-500">{p.price.toLocaleString('tr-TR')} ₺</span>
                            </div>
                        </div>
                    ))}
                </div>

                {step === 'criteria' && (
                    <ComparisonCriteria onGenerate={handleGenerate} />
                )}

                {step === 'analyzing' && (
                    <div className="flex flex-col items-center justify-center py-32 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-500">
                        <div className="relative">
                            <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 animate-pulse rounded-full"></div>
                            <Loader2 size={64} className="animate-spin text-indigo-600 dark:text-indigo-400 mb-6 relative z-10" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Yapay Zeka Analiz Ediyor</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-md text-center">
                            Seçtiğin kriterlere göre puanlamalar yapılıyor ve farklar inceleniyor...
                        </p>
                    </div>
                )}

                {step === 'results' && comparisonData && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Header Result */}
                        <div className="flex items-center gap-4">
                            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-2xl text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                                <BarChart3 size={32} />
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                                    Analiz Sonucu
                                </h1>
                                <p className="text-slate-500 dark:text-slate-400">Tercihlerine göre oluşturulan özel rapor</p>
                            </div>
                        </div>

                        {/* Comparison Table */}
                        <div className="overflow-hidden rounded-3xl shadow-xl shadow-indigo-100/50 dark:shadow-none border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[800px]">
                                    <thead>
                                        <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                            <th className="p-8 text-left w-1/4">
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">Özellikler</span>
                                            </th>
                                            {selectedProducts.map((product, idx) => {
                                                const scoreInfo = comparisonData.scores?.[idx] || { score: 0 };
                                                const isWinner = comparisonData.winner && comparisonData.winner.includes(product.name);

                                                return (
                                                    <th key={product.id} className="p-8 text-left w-1/4 align-top group transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                        <div className="flex flex-col items-center text-center relative">
                                                            {isWinner && (
                                                                <div className="absolute -top-6 bg-amber-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                                                                    <Trophy size={10} fill="currentColor" /> ÖNERİ
                                                                </div>
                                                            )}

                                                            {/* SCORE BADGE */}
                                                            <div className={`mb-4 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black border-4 ${scoreInfo.score >= 90 ? 'border-emerald-500 text-emerald-600 bg-emerald-50' : scoreInfo.score >= 80 ? 'border-indigo-500 text-indigo-600 bg-indigo-50' : 'border-amber-500 text-amber-600 bg-amber-50'}`}>
                                                                {scoreInfo.score}
                                                            </div>

                                                            <div className="flex items-center justify-center h-24 mb-4">
                                                                {product.image.startsWith('http') ? (
                                                                    <img src={product.image} alt={product.name} className="h-full object-contain" />
                                                                ) : (
                                                                    <span>{product.image}</span>
                                                                )}
                                                            </div>
                                                            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 leading-tight min-h-[3rem] flex items-center justify-center">{product.name}</h3>
                                                            <p className="text-indigo-600 dark:text-indigo-400 font-black text-xl tracking-tight mb-2">{product.price.toLocaleString('tr-TR')} <span className="text-sm text-slate-400 font-bold">₺</span></p>
                                                        </div>
                                                    </th>
                                                )
                                            })}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {/* Score Reasons Row */}
                                        <tr className="bg-indigo-50/30 dark:bg-indigo-900/10">
                                            <td className="p-6 font-bold text-indigo-900 dark:text-indigo-300 border-r border-indigo-100 dark:border-indigo-900/20">
                                                Yapay Zeka Yorumu
                                            </td>
                                            {comparisonData.scores?.map((s, i) => (
                                                <td key={i} className="p-6 text-center text-xs text-indigo-800 dark:text-indigo-300 font-medium italic border-r border-indigo-100 dark:border-indigo-900/20 last:border-0">
                                                    "{s.reason}"
                                                </td>
                                            ))}
                                        </tr>

                                        {comparisonData?.specs?.map((spec, i) => (
                                            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                                                <td className="p-6 font-bold text-slate-700 dark:text-slate-300 bg-slate-50/30 dark:bg-slate-800/10 group-hover:bg-slate-100/50 dark:group-hover:bg-slate-800/30 transition-colors border-r border-slate-100 dark:border-slate-800">
                                                    {spec.label}
                                                </td>
                                                {spec.values.map((val, idx) => (
                                                    <td key={idx} className="p-6 text-center text-slate-600 dark:text-slate-400 font-medium border-r border-slate-50 dark:border-slate-800/50 last:border-0">
                                                        {val || <Minus size={16} className="mx-auto opacity-20" />}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* AI Analysis Sections */}
                        <div className="grid md:grid-cols-3 gap-6">
                            {/* Differences */}
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-xl text-blue-600 dark:text-blue-400">
                                        <Sparkles size={20} />
                                    </div>
                                    <h3 className="font-bold text-lg">Temel Farklar</h3>
                                </div>
                                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                                    {comparisonData?.analysis?.differences || "Analiz bekleniyor..."}
                                </p>
                            </div>

                            {/* Pros/Cons */}
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-xl text-emerald-600 dark:text-emerald-400">
                                        <Check size={20} />
                                    </div>
                                    <h3 className="font-bold text-lg">Güçlü & Zayıf Yönler</h3>
                                </div>
                                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                                    {comparisonData?.analysis?.pros_cons || "Analiz bekleniyor..."}
                                </p>
                            </div>

                            {/* Price/Performance */}
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/10 transition-colors"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-xl text-indigo-600 dark:text-indigo-400">
                                            <Trophy size={20} />
                                        </div>
                                        <h3 className="font-bold text-lg">Fiyat / Performans</h3>
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
                                        {comparisonData?.analysis?.price_performance || "Analiz bekleniyor..."}
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}
