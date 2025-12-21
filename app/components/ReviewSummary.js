'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, Quote, CheckCircle2, XCircle, BrainCircuit } from 'lucide-react';

export default function ReviewSummary({ productName, trigger = false, onTrigger }) {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [hasTriggered, setHasTriggered] = useState(false);

    useEffect(() => {
        const fetchSummary = async () => {
            if (!productName || !(trigger || hasTriggered)) return;

            if (loading || summary) return;

            setLoading(true);
            setHasTriggered(true);

            try {
                const response = await fetch('/api/openai', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        messages: [],
                        type: 'summary',
                        productName: productName
                    })
                });

                if (!response.ok) throw new Error('API Error');

                const data = await response.json();
                let parsedData;
                try {
                    const jsonMatch = data.text.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        parsedData = JSON.parse(jsonMatch[0]);
                    } else {
                        throw new Error('No JSON found');
                    }
                } catch (e) {
                    parsedData = {
                        sentiment: data.text || "Veri alınamadı.",
                        pros: [],
                        cons: []
                    };
                }

                setSummary(parsedData);
            } catch (err) {
                console.error(err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
    }, [productName, trigger, hasTriggered]);

    if (!trigger && !hasTriggered) {
        return (
            <div className="relative group overflow-hidden rounded-3xl p-[2px] mb-8 transition-transform hover:scale-[1.01] duration-500">
                {/* Gradient Border Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-gradient-xy opacity-70 group-hover:opacity-100 transition-opacity"></div>

                <div className="relative bg-white dark:bg-slate-950 rounded-[22px] p-8 flex flex-col items-center justify-center text-center gap-6 h-full backdrop-blur-3xl">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-inner ring-1 ring-white/50 dark:ring-white/10">
                        <Sparkles size={32} className="animate-pulse" />
                    </div>

                    <div className="max-w-lg mx-auto">
                        <h3 className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
                            Yapay Zeka Değerlendirmesi
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">
                            {productName} hakkında internetteki binlerce gerçek kullanıcı yorumunun yapay zeka tarafından hazırlanan özeti.
                        </p>
                    </div>

                    <button
                        onClick={() => onTrigger && onTrigger()}
                        className="group/btn relative px-8 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all hover:-translate-y-1 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover/btn:opacity-10 transition-opacity"></div>
                        <span className="flex items-center gap-2 relative z-10">
                            <BrainCircuit size={18} /> Analizi Başlat
                        </span>
                    </button>

                    {/* Decorative Background Elements */}
                    <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                </div>
            </div>
        );
    }

    if (error) return null;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-indigo-100/30 dark:shadow-none mb-10 overflow-hidden relative">
            {loading ? (
                <div className="p-12 flex flex-col items-center justify-center gap-4 min-h-[300px]">
                    <div className="relative">
                        <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 animate-pulse rounded-full"></div>
                        <Loader2 size={48} className="animate-spin text-indigo-600 dark:text-indigo-400 relative z-10" />
                    </div>
                    <div className="text-center space-y-2">
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white">Analiz Ediliyor...</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Yorumlar taranıyor, artılar ve eksiler belirleniyor.</p>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col md:flex-row relative z-10">
                    {/* Left Side: Summary & Quote */}
                    <div className="md:w-5/12 bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-white flex flex-col justify-center relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-6 opacity-90">
                                <Sparkles size={20} className="text-yellow-300" />
                                <span className="text-xs font-bold uppercase tracking-wider text-indigo-100">Yapay Zeka Özeti</span>
                            </div>

                            <Quote size={48} className="text-white/20 absolute -top-2 -left-2 transform -scale-x-100" />

                            <p className="text-lg md:text-xl font-medium leading-relaxed italic text-indigo-50 relative z-10 pl-6 border-l-4 border-yellow-400/50 my-4">
                                "{summary?.sentiment}"
                            </p>

                            <div className="mt-6 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                                    <BrainCircuit size={20} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold">KıyasGO AI</p>
                                    <p className="text-[10px] text-indigo-200">Kullanıcı yorumlarına dayanır</p>
                                </div>
                            </div>
                        </div>

                        {/* Abstract Patterns */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
                    </div>

                    {/* Right Side: Pros & Cons */}
                    <div className="md:w-7/12 p-6 md:p-8 bg-white dark:bg-slate-900">
                        {summary && (
                            <div className="grid grid-cols-1 gap-6 h-full">
                                {/* Pros */}
                                <div className="space-y-4">
                                    <h4 className="flex items-center gap-2 text-sm font-bold text-green-600 dark:text-green-400 uppercase tracking-wide">
                                        <CheckCircle2 size={18} /> Beğenilen Yönler
                                    </h4>
                                    <div className="bg-green-50/50 dark:bg-green-900/10 rounded-xl p-4 border border-green-100 dark:border-green-900/20">
                                        <ul className="space-y-3">
                                            {summary.pros.map((item, i) => (
                                                <li key={i} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                                                    <div className="mt-0.5 min-w-[16px]">
                                                        <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                                                            <CheckCircle2 size={10} className="text-green-600 dark:text-green-400" />
                                                        </div>
                                                    </div>
                                                    <span className="font-medium">{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                {/* Cons */}
                                <div className="space-y-4">
                                    <h4 className="flex items-center gap-2 text-sm font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wide">
                                        <XCircle size={18} /> Eleştirilen Yönler
                                    </h4>
                                    <div className="bg-rose-50/50 dark:bg-rose-900/10 rounded-xl p-4 border border-rose-100 dark:border-rose-900/20">
                                        <ul className="space-y-3">
                                            {summary.cons.map((item, i) => (
                                                <li key={i} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                                                    <div className="mt-0.5 min-w-[16px]">
                                                        <div className="w-4 h-4 rounded-full bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center">
                                                            <XCircle size={10} className="text-rose-600 dark:text-rose-400" />
                                                        </div>
                                                    </div>
                                                    <span className="font-medium">{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
