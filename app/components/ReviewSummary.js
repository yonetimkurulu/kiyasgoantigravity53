'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, ThumbsUp, ThumbsDown, Loader2, Quote } from 'lucide-react';

export default function ReviewSummary({ productName, trigger = false }) {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [hasTriggered, setHasTriggered] = useState(false);

    useEffect(() => {
        const fetchSummary = async () => {
            if (!productName || !trigger || hasTriggered) return;

            setLoading(true);
            setHasTriggered(true);

            try {
                const response = await fetch('/api/openai', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        messages: [], // API expects messages array but we'll handle logic in route with 'type'
                        type: 'summary',
                        productName: productName
                    })
                });

                if (!response.ok) throw new Error('API Error');

                const data = await response.json();

                // Expecting JSON structure: { sentiment: "...", pros: ["..."], cons: ["..."] }
                // Need to parse the text response into this if API returns plain text,
                // But simplified for now, assuming API returns structured JSON or we parse it here.
                // Let's assume API returns raw text that we display, or structured.
                // For better UX, let's ask API for structured data.

                let parsedData;
                try {
                    // Start looking for JSON structure if mixed with text
                    const jsonMatch = data.text.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        parsedData = JSON.parse(jsonMatch[0]);
                    } else {
                        throw new Error('No JSON found');
                    }
                } catch (e) {
                    // Fallback if parsing fails (shouldn't happen with correct prompt)
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
    }, [productName]);

    if (error) return null; // Hide if error

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-slate-900 dark:to-slate-950 p-6 rounded-3xl border border-indigo-100 dark:border-indigo-900/40 shadow-sm mb-8 relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="bg-indigo-600 text-white p-2 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none">
                    <Sparkles size={20} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Yapay Zeka Değerlendirme Özeti
                </h3>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-8 gap-3 text-slate-400 animate-pulse">
                    <Loader2 size={32} className="animate-spin text-indigo-500" />
                    <span className="text-sm">İnternetteki binlerce yorum analiz ediliyor...</span>
                </div>
            ) : (
                <div className="space-y-6 relative z-10">
                    {/* General Sentiment */}
                    <div className="prose dark:prose-invert max-w-none">
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg font-medium border-l-4 border-indigo-500 pl-4 py-1 italic">
                            "{summary?.sentiment}"
                        </p>
                    </div>

                    {/* Pros & Cons Grid */}
                    {(summary?.pros?.length > 0 || summary?.cons?.length > 0) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                            {/* Pros */}
                            <div className="bg-green-50 dark:bg-green-900/20 p-5 rounded-2xl border border-green-100 dark:border-green-900/30">
                                <h4 className="flex items-center gap-2 font-bold text-green-700 dark:text-green-400 mb-3">
                                    <ThumbsUp size={18} /> Beğenilen Yönler
                                </h4>
                                <ul className="space-y-2">
                                    {summary.pros.map((item, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                                            <span className="text-green-500 mt-1">•</span> {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Cons */}
                            <div className="bg-rose-50 dark:bg-rose-900/20 p-5 rounded-2xl border border-rose-100 dark:border-rose-900/30">
                                <h4 className="flex items-center gap-2 font-bold text-rose-700 dark:text-rose-400 mb-3">
                                    <ThumbsDown size={18} /> Eleştirilen Yönler
                                </h4>
                                <ul className="space-y-2">
                                    {summary.cons.map((item, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                                            <span className="text-rose-500 mt-1">•</span> {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Background Decor */}
            <div className="absolute -right-10 -top-10 opacity-5 dark:opacity-10 pointer-events-none">
                <Quote size={200} />
            </div>
        </div>
    );
}
