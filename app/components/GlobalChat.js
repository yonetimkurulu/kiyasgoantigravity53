"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, X, Zap, Plus, MessageCircle, Maximize2, Check, AlertTriangle, Info } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useComparison } from '../context/ComparisonContext';

const CHAT_STORAGE_KEY = 'kiyasgo_assistant_messages_v1';
const DEFAULT_MESSAGES = [
    { role: 'ai', text: 'Merhaba! Ben **KıyasGO Asistan**. Fiyatlar ve özellikler hakkında bana soru sorabilirsin.' }
];

const suggestionKey = (suggestion) => {
    const raw = typeof suggestion === 'string'
        ? suggestion
        : (suggestion?.slug || suggestion?.name || '');

    const tokenSource = String(raw)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, ' ')
        .split(/[-\s]+/)
        .filter(Boolean);

    const drop = new Set([
        'gb', 'tb', 'mb', 'ram',
        'siyah', 'black', 'beyaz', 'white', 'mavi', 'blue', 'yesil', 'green', 'kirmizi', 'red',
        'mor', 'purple', 'pembe', 'pink', 'gri', 'gray', 'grey', 'silver', 'gold', 'altin', 'altn',
        'midnight', 'starlight', 'graphite', 'uzay', 'grisi', 'titanyum', 'titanium',
        '5g', '4g', 'lte', 'nfc', 'dualsim', 'dual', 'sim', 'tek', 'cift', 'ciftsim'
    ]);

    const kept = [];
    for (let index = 0; index < tokenSource.length; index += 1) {
        const token = tokenSource[index];
        const next = tokenSource[index + 1];

        if (/^\d+$/.test(token) && (next === 'gb' || next === 'tb' || next === 'mb' || next === 'ram')) {
            index += 1;
            continue;
        }

        if (drop.has(token)) continue;
        kept.push(token);
    }

    return kept.join(' ').trim();
};

const dedupeSuggestions = (list = []) => {
    const seen = new Set();
    const unique = [];

    for (const item of list) {
        const key = suggestionKey(item);
        if (!key || seen.has(key)) continue;
        seen.add(key);
        unique.push(item);
        if (unique.length === 3) break;
    }

    return unique;
};

// Typewriter Effect Component
// Simple Markdown Formatter (Bold only for now)
const escapeHtml = (text = '') => String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const FormattedText = ({ text }) => {
    // Escape HTML to prevent XSS (basic) but allow our specific tags
    const safeText = escapeHtml(text)
        // Replace **bold** with <strong>bold</strong>
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    return <div dangerouslySetInnerHTML={{ __html: safeText }} />;
};

const cleanAssistantText = (text = '') => {
    const normalized = String(text || '').replace(/\r\n/g, '\n');
    const lines = normalized.split('\n');

    const cleanedLines = lines
        .map((line) => line.replace(/\$+\s*SUGGESTION[A-Z]*\s*\$*[\s\S]*$/i, '').trimEnd())
        .filter((line) => !/s\s*u\s*g\s*g\s*e\s*s\s*t\s*i\s*o\s*n/i.test(line.replace(/[^a-z]/gi, '')));

    return cleanedLines
        .join('\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
};

const parseStructuredAssistantText = (text = '') => {
    const rawLines = String(text || '').split(/\r?\n/);
    const lines = rawLines.map((line) => line.trim());

    const prosIndex = lines.findIndex((line) => /^✅\s*artılar/i.test(line));
    const consIndex = lines.findIndex((line) => /^⚠️\s*dikkat\s*edilecekler/i.test(line));

    if (prosIndex < 0 || consIndex < 0 || consIndex <= prosIndex) {
        return null;
    }

    const introLines = lines.slice(0, prosIndex).filter(Boolean);
    const prosLines = lines
        .slice(prosIndex + 1, consIndex)
        .map((line) => line.replace(/^[-•]\s*/, '').trim())
        .filter(Boolean);
    const consLines = lines
        .slice(consIndex + 1)
        .map((line) => line.replace(/^[-•]\s*/, '').trim())
        .filter(Boolean);

    if (prosLines.length === 0 && consLines.length === 0) {
        return null;
    }

    const firstIntro = introLines[0] || '';
    const categoryMatch = firstIntro.match(/\(([^)]+)\)\s*:?$/);
    const categoryLabel = categoryMatch?.[1] ? categoryMatch[1].trim() : null;

    return {
        intro: introLines,
        pros: prosLines,
        cons: consLines,
        categoryLabel
    };
};

const toLowerTr = (value = '') => String(value)
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c');

const getCategoryBadgeTheme = (categoryLabel = '') => {
    const normalized = toLowerTr(categoryLabel);

    if (/telefon|iphone|android|cep/.test(normalized)) {
        return {
            wrapper: 'border-indigo-200 dark:border-indigo-900/60 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300'
        };
    }

    if (/laptop|notebook|dizustu|bilgisayar|pc/.test(normalized)) {
        return {
            wrapper: 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
        };
    }

    if (/tablet|ipad/.test(normalized)) {
        return {
            wrapper: 'border-sky-200 dark:border-sky-900/60 bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-300'
        };
    }

    if (/televizyon|tv|oled|qled|monitor|monit/.test(normalized)) {
        return {
            wrapper: 'border-violet-200 dark:border-violet-900/60 bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300'
        };
    }

    if (/kulak|headphone|earbud|hoparlor|hoparl/.test(normalized)) {
        return {
            wrapper: 'border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300'
        };
    }

    if (/kamera|dslr|gopro/.test(normalized)) {
        return {
            wrapper: 'border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300'
        };
    }

    if (/saat|watch/.test(normalized)) {
        return {
            wrapper: 'border-cyan-200 dark:border-cyan-900/60 bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-300'
        };
    }

    return {
        wrapper: 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300'
    };
};

const formatCategoryLabel = (value = '') => {
    const raw = String(value || '').trim();
    if (!raw) return null;
    return raw
        .replace(/-/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/\b\w/g, (m) => m.toUpperCase());
};

const buildSuggestionSignalBadges = (suggestion) => {
    if (!suggestion || typeof suggestion !== 'object') return [];
    const signals = suggestion.signals || {};
    const badges = [];
    const priorityFeatures = Array.isArray(suggestion.priorityFeatures) ? suggestion.priorityFeatures : [];

    if (Number.isFinite(signals.storageGb) && signals.storageGb > 0) {
        badges.push({
            id: 'storage',
            label: `Depolama: ${signals.storageGb >= 1024 ? `${Math.round(signals.storageGb / 1024)} TB` : `${signals.storageGb} GB`}`
        });
    }

    if (Number.isFinite(signals.batteryMah) && signals.batteryMah > 0) {
        badges.push({ id: 'battery', label: `Batarya: ${signals.batteryMah.toLocaleString('tr-TR')} mAh` });
    }

    if (Number.isFinite(signals.screenHz) && signals.screenHz > 0) {
        badges.push({ id: 'screen', label: `Ekran: ${signals.screenHz} Hz` });
    }

    if (signals.gpuModel) {
        badges.push({ id: 'performance', label: `GPU: ${signals.gpuModel}` });
    }

    if (signals.thermalLevel === 'good') {
        badges.push({ id: 'thermal', label: 'Isınma: Serin' });
    } else if (signals.thermalLevel === 'mid') {
        badges.push({ id: 'thermal', label: 'Isınma: Dengeli' });
    } else if (signals.thermalLevel === 'hot') {
        badges.push({ id: 'thermal', label: 'Isınma: Yükte artabilir' });
    }

    if (Number.isFinite(suggestion.score)) {
        badges.push({ id: 'score', label: `Öneri skoru: ${Math.max(0, Math.round(suggestion.score))}` });
    }

    const getOrder = (id) => {
        if (id === 'score') return 999;
        const index = priorityFeatures.indexOf(id);
        return index >= 0 ? index : 100;
    };

    return badges
        .sort((a, b) => getOrder(a.id) - getOrder(b.id))
        .map((entry) => entry.label)
        .slice(0, 3);
};

const StructuredAssistantText = ({ text, fullPage = false }) => {
    const structured = parseStructuredAssistantText(text);

    if (!structured) {
        return <FormattedText text={text} />;
    }

    const badgeTheme = getCategoryBadgeTheme(structured.categoryLabel || '');

    return (
        <div className={`${fullPage ? 'space-y-4' : 'space-y-3'}`}>
            {structured.categoryLabel && (
                <div className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${badgeTheme.wrapper}`}>
                    Kategori: {structured.categoryLabel}
                </div>
            )}

            {structured.intro.length > 0 && (
                <div className={`${fullPage ? 'space-y-2' : 'space-y-1'}`}>
                    {structured.intro.map((line, index) => (
                        <div key={`intro-${index}`} className={`${fullPage ? 'text-sm md:text-[15px]' : 'text-sm md:text-base'} text-slate-700 dark:text-slate-300`}>
                            <FormattedText text={line} />
                        </div>
                    ))}
                </div>
            )}

            <div className={`grid grid-cols-1 ${fullPage ? 'lg:grid-cols-2' : 'md:grid-cols-2'} ${fullPage ? 'gap-4' : 'gap-3'}`}>
                <div className={`rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/80 dark:bg-emerald-950/20 ${fullPage ? 'p-4' : 'p-3'}`}>
                    <p className="text-xs font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300 mb-2 flex items-center gap-1.5">
                        <Check size={14} /> Artılar
                    </p>
                    <ul className="space-y-1.5 text-sm text-emerald-800 dark:text-emerald-200">
                        {structured.pros.map((item, index) => (
                            <li key={`pro-${index}`} className="leading-relaxed">• {item}</li>
                        ))}
                    </ul>
                </div>

                <div className={`rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/80 dark:bg-amber-950/20 ${fullPage ? 'p-4' : 'p-3'}`}>
                    <p className="text-xs font-bold uppercase tracking-wide text-amber-700 dark:text-amber-300 mb-2 flex items-center gap-1.5">
                        <AlertTriangle size={14} /> Dikkat Edilecekler
                    </p>
                    <ul className="space-y-1.5 text-sm text-amber-800 dark:text-amber-200">
                        {structured.cons.map((item, index) => (
                            <li key={`con-${index}`} className="leading-relaxed">• {item}</li>
                        ))}
                    </ul>
                </div>
            </div>

            {fullPage && (
                <div className="rounded-xl border border-sky-200 dark:border-sky-900/60 bg-sky-50/80 dark:bg-sky-950/20 p-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-sky-700 dark:text-sky-300 flex items-center gap-1.5">
                        <Info size={14} /> Kısa Not
                    </p>
                    <p className="mt-1 text-sm text-sky-800 dark:text-sky-200">Bu değerlendirme mevcut ürün verisine göre otomatik hazırlanır; satın almadan önce güncel mağaza fiyatını kontrol et.</p>
                </div>
            )}
        </div>
    );
};

export default function GlobalChat({ forceOpen = false, fullPage = false }) {
    const router = useRouter();
    const { addToComparison } = useComparison();
    const [chatOpen, setChatOpen] = useState(forceOpen);
    const [messages, setMessages] = useState(DEFAULT_MESSAGES);
    const [isTyping, setIsTyping] = useState(false);
    const chatEndRef = useRef(null);
    const chatAreaRef = useRef(null);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(CHAT_STORAGE_KEY);
            if (!raw) return;

            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
                setMessages(parsed);
            }
        } catch (error) {
            console.error('Assistant history load failed:', error);
        }
    }, []);

    useEffect(() => {
        try {
            const compact = messages.slice(-40);
            localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(compact));
        } catch (error) {
            console.error('Assistant history save failed:', error);
        }
    }, [messages]);

    // Shared message processing logic
    const processMessage = async (text) => {
        if (!text) return;

        setMessages(prev => [...prev, { role: 'user', text }]);
        setIsTyping(true);

        try {
            const historyMessages = messages
                .slice(-8)
                .map((msg) => ({
                    role: msg.role === 'ai' ? 'assistant' : 'user',
                    content: msg.text
                }));

            const response = await fetch('/api/openai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'assistant',
                    prompt: text,
                    messages: [...historyMessages, { role: 'user', content: text }]
                })
            });

            if (!response.ok) {
                throw new Error("API hatası");
            }

            const data = await response.json();
            let aiResponse = data.text || data.result || data.analysis || "Şu an cevap veremiyorum.";
            let suggestions = Array.isArray(data.suggestions) ? dedupeSuggestions(data.suggestions) : [];

            aiResponse = cleanAssistantText(aiResponse) || "Şu an cevap veremiyorum.";

            setMessages(prev => [...prev, { role: 'ai', text: aiResponse, suggestions }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'ai', text: "Şu an sunucuya bağlanamıyorum. (Backend Offline?)" }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        const form = e.target;
        const input = form.elements.msgInput;
        const text = input.value.trim();

        if (text) {
            await processMessage(text);
            input.value = '';
        }
    };

    // Listen for external chat triggers (e.g. from ProductDetailView)
    useEffect(() => {
        if (forceOpen) {
            setChatOpen(true);
        }
    }, [forceOpen]);

    useEffect(() => {
        if (!fullPage) {
            router.prefetch('/asistan');
        } else {
            router.prefetch('/');
        }
    }, [fullPage, router]);

    useEffect(() => {
        if (fullPage) return;
        const handleOpenChat = (event) => {
            console.log("GlobalChat received openChat event", event.detail);
            setChatOpen(true);
            const initialMessage = event.detail?.message;
            if (initialMessage) {
                processMessage(initialMessage);
            }
        };

        window.addEventListener('openChat', handleOpenChat);
        return () => window.removeEventListener('openChat', handleOpenChat);
    }, [fullPage]);

    useEffect(() => {
        if (fullPage && chatAreaRef.current) {
            chatAreaRef.current.scrollTo({ top: chatAreaRef.current.scrollHeight, behavior: 'smooth' });
            return;
        }
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, [messages, chatOpen]);

    if (!chatOpen) return null;

    return (
        <div className={`${fullPage ? 'relative w-full h-full z-10' : 'fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6'} font-sans`}>
            {/* Backdrop */}
            {!fullPage && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setChatOpen(false)}></div>
            )}

            {/* Modal Content */}
            <div className={`relative w-full h-full bg-white dark:bg-slate-900 flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200 ${fullPage ? '' : 'md:max-w-2xl md:h-[600px] md:rounded-2xl shadow-2xl'}`}>
                {/* Modal Header */}
                <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-800 dark:to-purple-800 text-white flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg"><Zap size={20} fill="currentColor" /></div>
                        <div>
                            <h3 className="font-bold text-lg">KıyasGO Asistan</h3>
                            <p className="text-xs text-indigo-100 opacity-80">Yapay zeka ile sohbet et</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {!fullPage && (
                            <Link
                                href="/asistan"
                                scroll={true}
                                onClick={() => setChatOpen(false)}
                                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                                title="Tam sayfa aç"
                            >
                                <Maximize2 size={18} />
                            </Link>
                        )}
                        {fullPage ? (
                            <Link href="/" className="p-2 hover:bg-white/20 rounded-full transition-colors" title="Kapat">
                                <X size={24} />
                            </Link>
                        ) : (
                            <button onClick={() => setChatOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors" title="Kapat">
                                <X size={24} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div ref={chatAreaRef} className={`flex-1 overflow-y-auto ${fullPage ? 'p-5 md:p-6' : 'p-4'} space-y-4 bg-gradient-to-b from-slate-50 to-slate-100/70 dark:from-slate-950 dark:to-slate-900`}>
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`${fullPage ? 'max-w-[92%] md:max-w-[84%]' : 'max-w-[90%] md:max-w-[80%]'} p-4 md:p-5 rounded-2xl text-[15px] md:text-base leading-relaxed shadow-sm ${msg.role === 'user'
                                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-500 dark:to-violet-500 text-white rounded-br-none shadow-indigo-200/60 dark:shadow-none'
                                : 'bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-200 border border-slate-200/90 dark:border-slate-800 rounded-bl-none shadow-slate-200/60 dark:shadow-black/20'
                                }`}>
                                {msg.role === 'ai' ? (
                                    <div>
                                        <div className="whitespace-pre-wrap">
                                            <StructuredAssistantText text={msg.text} fullPage={fullPage} />
                                        </div>
                                        {msg.suggestions && msg.suggestions.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-slate-200/90 dark:border-slate-800 animate-in fade-in slide-in-from-top-2">
                                                <div className="mb-3 flex items-center justify-between gap-2">
                                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Önerilen Ürünler</p>
                                                    <span className="inline-flex items-center rounded-full border border-slate-200 dark:border-slate-700 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                                                        {msg.suggestions.length} ürün
                                                    </span>
                                                </div>
                                                <div className="flex flex-col gap-3">
                                                    {msg.suggestions.map((suggestion, idx) => {
                                                        const productName = typeof suggestion === 'string' ? suggestion : suggestion.name;
                                                        const productHref = typeof suggestion === 'string'
                                                            ? `/arama?q=${encodeURIComponent(suggestion)}`
                                                            : (suggestion.url || `/arama?q=${encodeURIComponent(suggestion.name || '')}`);
                                                        const compareProduct = typeof suggestion === 'string'
                                                            ? {
                                                                id: productName.toLowerCase().replace(/\s+/g, '-'),
                                                                slug: productName.toLowerCase().replace(/\s+/g, '-'),
                                                                subcategory: 'genel',
                                                                name: productName,
                                                                image: '📦',
                                                                price: 0,
                                                            }
                                                            : {
                                                                id: suggestion.id || suggestion.slug || suggestion.name,
                                                                slug: suggestion.slug || suggestion.id || suggestion.name,
                                                                subcategory: suggestion.subcategory || 'genel',
                                                                name: suggestion.name,
                                                                image: suggestion.image || '📦',
                                                                price: suggestion.price || 0,
                                                            };
                                                        const priceText = typeof suggestion === 'object' && suggestion?.price
                                                            ? `~${Number(suggestion.price).toLocaleString('tr-TR')} ₺`
                                                            : null;
                                                        const imageSrc = typeof suggestion === 'object' ? suggestion?.image : null;
                                                        const rawSuggestionCategory = typeof suggestion === 'object'
                                                            ? (suggestion.subcategory || suggestion.category || '')
                                                            : '';
                                                        const suggestionCategoryLabel = formatCategoryLabel(rawSuggestionCategory);
                                                        const suggestionTheme = getCategoryBadgeTheme(suggestionCategoryLabel || '');
                                                        const signalBadges = buildSuggestionSignalBadges(suggestion);

                                                        return (
                                                        <div key={idx} className="group bg-slate-50/90 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-700/60 transition-colors flex flex-wrap items-center justify-between gap-3">
                                                            <div className="flex items-center gap-3 min-w-0">
                                                                <div className="w-14 h-14 aspect-square rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                                                                    {imageSrc ? (
                                                                        <img
                                                                            src={imageSrc}
                                                                            alt={productName}
                                                                            className="w-full h-full object-contain p-1.5 transition-transform duration-300 group-hover:scale-105"
                                                                            loading="lazy"
                                                                        />
                                                                    ) : (
                                                                        <span className="text-lg">📦</span>
                                                                    )}
                                                                </div>
                                                                <div className="flex flex-col min-w-0">
                                                                <span className="font-medium text-slate-700 dark:text-slate-300 text-sm">{productName}</span>
                                                                {suggestionCategoryLabel && (
                                                                    <span className={`mt-1 inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${suggestionTheme.wrapper}`}>
                                                                        {suggestionCategoryLabel}
                                                                    </span>
                                                                )}
                                                                {priceText && <span className="text-xs text-slate-500 dark:text-slate-400">{priceText}</span>}
                                                                {typeof suggestion === 'object' && suggestion?.reason && (
                                                                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{suggestion.reason}</span>
                                                                )}
                                                                {signalBadges.length > 0 && (
                                                                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                                                                        {signalBadges.map((badge, badgeIndex) => (
                                                                            <span key={`signal-${badgeIndex}`} className="inline-flex items-center rounded-full border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                                                                                {badge}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2 shrink-0">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => addToComparison(compareProduct)}
                                                                    className="bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 px-3 py-2 rounded-lg text-xs font-bold border border-indigo-100 dark:border-slate-600 hover:bg-indigo-50 dark:hover:bg-slate-600 transition-colors flex items-center gap-1"
                                                                >
                                                                    <Plus size={14} /> Kıyasla
                                                                </button>
                                                                <Link
                                                                    href={productHref}
                                                                    onClick={() => setChatOpen(false)}
                                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-sm"
                                                                >
                                                                    <ArrowRight size={14} /> Ürüne Git
                                                                </Link>
                                                            </div>
                                                        </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : msg.text}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-white dark:bg-slate-900 px-4 py-3 rounded-2xl rounded-bl-none border border-slate-200 dark:border-slate-800 flex gap-1 shadow-sm">
                                <div className="w-2 h-2 bg-slate-400 dark:bg-slate-600 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-slate-400 dark:bg-slate-600 rounded-full animate-bounce delay-75"></div>
                                <div className="w-2 h-2 bg-slate-400 dark:bg-slate-600 rounded-full animate-bounce delay-150"></div>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-3 shrink-0">
                    <input
                        name="msgInput"
                        type="text"
                        placeholder={isTyping ? "Cevap bekleniyor..." : "Bir soru sorun..."}
                        className={`flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-800 rounded-full text-base outline-none focus:bg-white dark:focus:bg-slate-950 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 ${isTyping ? 'opacity-50 cursor-not-allowed' : ''}`}
                        autoFocus={!fullPage}
                        disabled={isTyping}
                    />
                    <button
                        type="submit"
                        disabled={isTyping}
                        className={`bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white p-3 rounded-full transition-colors shadow-md shadow-indigo-200 dark:shadow-none flex items-center justify-center aspect-square ${isTyping ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <ArrowRight size={24} />
                    </button>
                </form>
            </div>
        </div>
    );
}
