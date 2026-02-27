'use client';

import React, { useState } from 'react';
import { Sparkles, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

export default function AIRecommendation({ productId, trigger }) {
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [error, setError] = useState(null);

    const handleAnalyze = async () => {
        if (!productId) {
            setError('Bu ürün için analiz verisi henüz hazır değil.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/ai-compare', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data?.error || 'Analiz yapılamadı');
            }

            setAnalysis(data);
        } catch (err) {
            setError(err?.message || 'Yapay zeka şu an yanıt veremiyor.');
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        if (trigger && productId && !analysis && !loading) {
            handleAnalyze();
        }
    }, [trigger, analysis, loading, productId]);

    return (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100 mb-8">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-indigo-900 flex items-center gap-2">
                    <Sparkles className="text-indigo-600" /> Yapay Zeka Asistanı
                </h3>
                {!analysis && !loading && (
                    <button
                        onClick={handleAnalyze}
                        disabled={!productId}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-md ${productId
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-lg'
                            : 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                            }`}
                    >
                        Fiyatı Analiz Et
                    </button>
                )}
            </div>

            {loading && (
                <div className="flex items-center gap-3 text-indigo-600 animate-pulse">
                    <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="font-medium">Fiyat geçmişi ve piyasa verileri inceleniyor...</span>
                </div>
            )}

            {error && (
                <div className="text-red-600 flex items-center gap-2 bg-red-50 p-3 rounded-lg">
                    <AlertCircle size={18} /> {error}
                </div>
            )}

            {analysis && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-start gap-4 mb-6">
                        <div className={`
              w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shadow-sm shrink-0
              ${analysis.recommendation === 'Al' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}
            `}>
                            {analysis.score}/10
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`text-lg font-black ${analysis.recommendation === 'Al' ? 'text-green-700' : 'text-yellow-700'}`}>
                                    {analysis.recommendation === 'Al' ? 'FIRSAT ÜRÜNÜ! ✅' : 'BEKLEMENİ ÖNERİRİM ⚠️'}
                                </span>
                            </div>
                            <p className="text-gray-700 leading-relaxed text-sm">
                                {analysis.reason}
                            </p>
                        </div>
                    </div>

                    {/* Price History & Trend Graph */}
                    {analysis.priceHistory && analysis.priceHistory.length > 0 && (
                        <div className="bg-white/50 rounded-xl p-4 border border-indigo-100">
                            <h4 className="text-sm font-bold text-indigo-900 mb-3 flex items-center justify-between">
                                <span>📈 Fiyat Grafiği (Son 6 Ay)</span>
                                {analysis.trend && (
                                    <span className={`text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1 ${analysis.trend === 'artış' ? 'bg-red-100 text-red-600' : analysis.trend === 'azalış' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                                        {analysis.trend === 'artış' ? 'Artış Eğiliminde ↗' : analysis.trend === 'azalış' ? 'Düşüş Eğiliminde ↘' : 'Stabil Seyrediyor →'}
                                    </span>
                                )}
                            </h4>

                            {/* Simple SVG Chart */}
                            <div className="h-24 w-full relative mb-2">
                                <svg className="w-full h-full overflow-visible" viewBox="0 0 100 50" preserveAspectRatio="none">
                                    {/* Gradient Definition */}
                                    <defs>
                                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                                            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>

                                    {(() => {
                                        const prices = analysis.priceHistory.map(h => h.price);
                                        const min = Math.min(...prices) * 0.95;
                                        const max = Math.max(...prices) * 1.05;
                                        const range = (max - min) || 1;

                                        // Calculate Points
                                        const points = analysis.priceHistory.map((h, i) => {
                                            const x = (i / (analysis.priceHistory.length - 1)) * 100;
                                            const y = 50 - ((h.price - min) / range) * 50;
                                            return `${x},${y}`;
                                        }).join(' ');

                                        const fillPath = `0,50 ${points} 100,50`;

                                        return (
                                            <>
                                                <path d={`M${fillPath}`} fill="url(#chartGradient)" />
                                                <polyline
                                                    points={points}
                                                    fill="none"
                                                    stroke="#6366f1"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    vectorEffect="non-scaling-stroke"
                                                />
                                                {analysis.priceHistory.map((h, i) => {
                                                    const x = (i / (analysis.priceHistory.length - 1)) * 100;
                                                    const y = 50 - ((h.price - min) / range) * 50;
                                                    return (
                                                        <circle key={i} cx={x} cy={y} r="1.5" fill="white" stroke="#6366f1" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                                                    )
                                                })}
                                            </>
                                        );
                                    })()}
                                </svg>

                                {/* X-Axis Labels */}
                                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                                    {analysis.priceHistory.map((h, i) => (
                                        <span key={i}>{h.month}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Forecast / Insight */}
                    {(analysis.forecast || analysis.trend_desc) && (
                        <div className="mt-3 text-xs bg-indigo-100/50 p-3 rounded-lg border border-indigo-100 text-indigo-800 flex gap-2">
                            <Sparkles size={16} className="shrink-0 mt-0.5" />
                            <p>
                                <strong>Yapay Zeka Öngörüsü:</strong> {analysis.trend_desc} {analysis.forecast}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
