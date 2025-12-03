'use client';

import React, { useState } from 'react';
import { Sparkles, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

export default function AIRecommendation({ productId }) {
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [error, setError] = useState(null);

    const handleAnalyze = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/ai-compare', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId }),
            });

            if (!res.ok) throw new Error('Analiz yapılamadı');

            const data = await res.json();
            setAnalysis(data);
        } catch (err) {
            setError('Yapay zeka şu an yanıt veremiyor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100 mb-8">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-indigo-900 flex items-center gap-2">
                    <Sparkles className="text-indigo-600" /> Yapay Zeka Asistanı
                </h3>
                {!analysis && !loading && (
                    <button
                        onClick={handleAnalyze}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-md hover:shadow-lg"
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
                    <div className="flex items-start gap-4">
                        <div className={`
              w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shadow-sm
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
                            <p className="text-gray-700 leading-relaxed">
                                {analysis.reason}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
