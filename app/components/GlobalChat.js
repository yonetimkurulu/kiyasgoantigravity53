"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, X, Zap, Plus, MessageCircle } from 'lucide-react';
import Link from 'next/link';

// Typewriter Effect Component
// Simple Markdown Formatter (Bold only for now)
const FormattedText = ({ text }) => {
    // Escape HTML to prevent XSS (basic) but allow our specific tags
    const safeText = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        // Replace **bold** with <strong>bold</strong>
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    return <div dangerouslySetInnerHTML={{ __html: safeText }} />;
};

export default function GlobalChat() {
    const [chatOpen, setChatOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'ai', text: 'Merhaba! Ben **KıyasGO Asistan**. Fiyatlar ve özellikler hakkında bana soru sorabilirsin.' }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const chatEndRef = useRef(null);

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
            let suggestions = Array.isArray(data.suggestions) ? data.suggestions : [];

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
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, chatOpen]);

    if (!chatOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6 font-sans">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setChatOpen(false)}></div>

            {/* Modal Content */}
            <div className="relative w-full h-full md:max-w-2xl md:h-[600px] bg-white dark:bg-slate-900 md:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Modal Header */}
                <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-800 dark:to-purple-800 text-white flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg"><Zap size={20} fill="currentColor" /></div>
                        <div>
                            <h3 className="font-bold text-lg">KıyasGO Asistan</h3>
                            <p className="text-xs text-indigo-100 opacity-80">Yapay zeka ile sohbet et</p>
                        </div>
                    </div>
                    <button onClick={() => setChatOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[90%] md:max-w-[80%] p-5 rounded-2xl text-base md:text-lg leading-relaxed shadow-sm ${msg.role === 'user'
                                ? 'bg-indigo-600 dark:bg-indigo-500 text-white rounded-br-none'
                                : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-bl-none'
                                }`}>
                                {msg.role === 'ai' ? (
                                    <div>
                                        <div className="whitespace-pre-wrap">
                                            <FormattedText text={msg.text} />
                                        </div>
                                        {msg.suggestions && msg.suggestions.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-top-2">
                                                <p className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wide">Önerilen Ürünler</p>
                                                <div className="flex flex-col gap-3">
                                                    {msg.suggestions.map((suggestion, idx) => {
                                                        const productName = typeof suggestion === 'string' ? suggestion : suggestion.name;
                                                        const productHref = typeof suggestion === 'string'
                                                            ? `/arama?q=${encodeURIComponent(suggestion)}`
                                                            : (suggestion.url || `/arama?q=${encodeURIComponent(suggestion.name || '')}`);
                                                        const priceText = typeof suggestion === 'object' && suggestion?.price
                                                            ? `~${Number(suggestion.price).toLocaleString('tr-TR')} ₺`
                                                            : null;

                                                        return (
                                                        <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                                                            <div className="flex flex-col">
                                                                <span className="font-medium text-slate-700 dark:text-slate-300 text-sm">{productName}</span>
                                                                {priceText && <span className="text-xs text-slate-500 dark:text-slate-400">{priceText}</span>}
                                                                {typeof suggestion === 'object' && suggestion?.reason && (
                                                                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{suggestion.reason}</span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Link
                                                                    href={`/arama?q=${encodeURIComponent(productName)}`}
                                                                    className="bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 px-3 py-2 rounded-lg text-xs font-bold border border-indigo-100 dark:border-slate-600 hover:bg-indigo-50 dark:hover:bg-slate-600 transition-colors flex items-center gap-1"
                                                                >
                                                                    <Plus size={14} /> Kıyasla
                                                                </Link>
                                                                <Link
                                                                    href={productHref}
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
                        autoFocus
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
