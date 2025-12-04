'use client';

import React, { useEffect, useState } from 'react';
import { useComparison } from '@/app/context/ComparisonContext';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Zap, Check, X, Loader2 } from 'lucide-react';
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
                const prompt = `Aşağıdaki ürünleri karşılaştıran detaylı bir tablo oluştur. Çıktı sadece JSON formatında olsun.
        Ürünler: ${productNames}
        
        JSON Formatı:
        {
          "features": ["Ekran", "İşlemci", "Kamera", "Batarya", "Fiyat/Performans"],
          "products": [
            {
              "name": "Ürün Adı",
              "values": ["6.1 inç OLED", "A15 Bionic", "12MP Çift", "3279 mAh", "8/10"]
            }
          ]
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
                    }))
                });
            } finally {
                setLoading(false);
            }
        };

        fetchComparison();
    }, [selectedProducts, router]);

    if (selectedProducts.length === 0) return null;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <Link href="/" className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-8 transition-colors">
                    <ArrowLeft size={20} /> Geri Dön
                </Link>

                <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                    <Zap className="text-indigo-600 dark:text-indigo-400" size={32} fill="currentColor" />
                    Ürün Karşılaştırma
                </h1>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 size={48} className="animate-spin text-indigo-600 dark:text-indigo-400 mb-4" />
                        <p className="text-lg font-medium text-slate-600 dark:text-slate-300">Yapay zeka karşılaştırma tablosunu hazırlıyor...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                        <table className="w-full min-w-[800px]">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50">
                                    <th className="p-6 text-left w-1/4">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Özellikler</span>
                                    </th>
                                    {selectedProducts.map((product) => (
                                        <th key={product.id} className="p-6 text-left w-1/4 align-top">
                                            <div className="flex flex-col items-center text-center">
                                                <div className="text-6xl mb-4">{product.image}</div>
                                                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">{product.name}</h3>
                                                <p className="text-indigo-600 dark:text-indigo-400 font-bold text-xl">{product.price.toLocaleString('tr-TR')} ₺</p>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {comparisonData?.features.map((feature, i) => (
                                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="p-6 font-bold text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/20">
                                            {feature}
                                        </td>
                                        {comparisonData.products.map((p, j) => (
                                            <td key={j} className="p-6 text-center text-slate-600 dark:text-slate-400 font-medium">
                                                {p.values[i] || "-"}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
