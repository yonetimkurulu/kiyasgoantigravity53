'use client';

import React, { useEffect, useState } from 'react';
import { useComparison } from '@/app/context/ComparisonContext';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Zap, Check, X, Loader2, Sparkles, Trophy } from 'lucide-react';
import Link from 'next/link';

export default function ComparisonPage() {
    const { selectedProducts } = useComparison();
    const router = useRouter();
    const [comparisonData, setComparisonData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (selectedProducts.length === 0) {
            router.push('/');
            return;
        }

        const fetchComparison = async () => {
            try {
                const productNames = selectedProducts.map(p => p.name).join(', ');
                const prompt = `Aşağıdaki ürünleri karşılaştıran detaylı bir tablo ve sonuç özeti oluştur. Çıktı sadece JSON formatında olsun.
        Ürünler: ${productNames}
        
        JSON Formatı:
        {
          "features": ["Ekran", "İşlemci", "Kamera", "Batarya", "Fiyat/Performans"],
          "products": [
            {
              "name": "Ürün Adı",
              "values": ["6.1 inç OLED", "A15 Bionic", "12MP Çift", "3279 mAh", "8/10"]
            }
          ],
          "summary": "Bu ürünler arasında X, performansıyla öne çıkarken, Y fiyat avantajı sunuyor. Eğer kamera önceliğiniz ise Z modelini tercih etmelisiniz.",
          "winner": "Ürün Adı (veya 'Berabere')"
        }
        
        Lütfen sadece JSON döndür, başka metin ekleme.`;

                const response = await fetch('/api/gemini', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt })
                });

                const data = await response.json();
                let result = data.result;

                // Clean markdown code blocks if present
                result = result.replace(/```json/g, '').replace(/```/g, '').trim();

                setComparisonData(JSON.parse(result));
            } catch (error) {
                console.error("Comparison failed:", error);
                // Fallback data if AI fails
                setComparisonData({
                    features: ["Kategori", "Fiyat", "Puan"],
                    products: selectedProducts.map(p => ({
                        name: p.name,
                        values: [p.category, `${p.price} TL`, p.rating]
                    })),
                    summary: "Yapay zeka bağlantısında bir sorun oluştuğu için detaylı analiz yapılamadı. Temel bilgileri yukarıda görebilirsiniz.",
                    winner: "-"
                });
            } finally {
                setLoading(false);
            }
        };

        fetchComparison();
    }, [selectedProducts, router]);

    if (selectedProducts.length === 0) return null;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 p-4 md:p-8 pb-32">
            <div className="max-w-7xl mx-auto">
                <Link href="/" className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-8 transition-colors font-medium">
                    <ArrowLeft size={20} /> Geri Dön
                </Link>

                <div className="flex items-center gap-4 mb-8">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-2xl text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                        <Zap size={32} fill="currentColor" />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                            Ürün Karşılaştırma
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400">Yapay zeka destekli detaylı analiz</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                        <div className="relative">
                            <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 animate-pulse rounded-full"></div>
                            <Loader2 size={64} className="animate-spin text-indigo-600 dark:text-indigo-400 mb-6 relative z-10" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Analiz Hazırlanıyor</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-md text-center">
                            Seçtiğiniz ürünlerin teknik özelliklerini, fiyatlarını ve kullanıcı yorumlarını analiz ediyoruz...
                        </p>
                    </div>
                ) : (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {/* Comparison Table */}
                        <div className="overflow-hidden rounded-3xl shadow-xl shadow-indigo-100/50 dark:shadow-none border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[800px]">
                                    <thead>
                                        <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                            <th className="p-8 text-left w-1/4">
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">Özellikler</span>
                                            </th>
                                            {selectedProducts.map((product) => (
                                                <th key={product.id} className="p-8 text-left w-1/4 align-top group transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                    <div className="flex flex-col items-center text-center relative">
                                                        {comparisonData?.winner === product.name && (
                                                            <div className="absolute -top-6 bg-amber-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                                                                <Trophy size={10} fill="currentColor" /> KAZANAN
                                                            </div>
                                                        )}
                                                        <div className="text-7xl mb-6 transform group-hover:scale-110 transition-transform duration-300 drop-shadow-lg">{product.image}</div>
                                                        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 leading-tight min-h-[3rem] flex items-center justify-center">{product.name}</h3>
                                                        <p className="text-indigo-600 dark:text-indigo-400 font-black text-2xl tracking-tight">{product.price.toLocaleString('tr-TR')} <span className="text-sm text-slate-400 font-bold">₺</span></p>
                                                    </div>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {comparisonData?.features.map((feature, i) => (
                                            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                                                <td className="p-6 font-bold text-slate-700 dark:text-slate-300 bg-slate-50/30 dark:bg-slate-800/10 group-hover:bg-slate-100/50 dark:group-hover:bg-slate-800/30 transition-colors border-r border-slate-100 dark:border-slate-800">
                                                    {feature}
                                                </td>
                                                {comparisonData.products.map((p, j) => (
                                                    <td key={j} className="p-6 text-center text-slate-600 dark:text-slate-400 font-medium border-r border-slate-50 dark:border-slate-800/50 last:border-0">
                                                        {p.values[i] || "-"}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* AI Summary Card */}
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 md:p-10 text-white shadow-2xl shadow-indigo-900/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-rose-500 opacity-10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="bg-white/20 backdrop-blur-md p-2 rounded-lg">
                                        <Sparkles size={24} className="text-yellow-300" fill="currentColor" />
                                    </div>
                                    <h2 className="text-2xl font-bold">Yapay Zeka Özeti</h2>
                                </div>

                                <p className="text-indigo-50 dark:text-indigo-100 text-lg leading-relaxed font-medium opacity-95 max-w-4xl">
                                    {comparisonData?.summary}
                                </p>

                                {comparisonData?.winner && comparisonData.winner !== 'Berabere' && (
                                    <div className="mt-8 inline-flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 px-5 py-3 rounded-xl">
                                        <Trophy size={20} className="text-yellow-300" fill="currentColor" />
                                        <span className="font-bold">Önerilen Seçim: <span className="text-yellow-300">{comparisonData.winner}</span></span>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}
