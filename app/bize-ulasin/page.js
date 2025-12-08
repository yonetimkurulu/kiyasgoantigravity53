'use client';

import React, { useState } from 'react';
import Header from '../components/Header';
import { Mail, User, Send, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: 'KıyasGO İletişim',
        message: ''
    });
    const [status, setStatus] = useState('idle'); // idle, loading, success, error

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');

        try {
            // Direct submission to FormSubmit.co from Client
            // Using UNIQUE ID from activation email to fix domain issues and secure email
            const res = await fetch("https://formsubmit.co/ajax/3c037040f97b91450c6d25e8b2cc67c7", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    message: formData.message,
                    _subject: `[KıyasGO] ${formData.subject}`,
                    _template: 'table',
                    _captcha: 'false'
                })
            });

            if (res.ok) {
                setStatus('success');
                setFormData({ name: '', email: '', subject: 'KıyasGO İletişim', message: '' });
            } else {
                setStatus('error');
            }
        } catch (error) {
            console.error("Submission failed", error);
            setStatus('error');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-700 dark:selection:bg-indigo-900 dark:selection:text-indigo-100 transition-colors duration-300">
            <Header />

            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-12 md:py-20 flex md:items-center justify-center">
                <div className="w-full max-w-7xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col md:flex-row min-h-[700px]">

                    {/* Left: Info */}
                    <div className="md:w-2/5 bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-10 flex flex-col justify-between">
                        <div>
                            <h1 className="text-3xl font-black mb-6 tracking-tight">Bize Ulaşın</h1>
                            <p className="text-indigo-100 leading-relaxed mb-8">
                                Görüşleriniz bizim için çok değerli. Sorularınız, önerileriniz veya işbirliği teklifleriniz için formu doldurabilirsiniz.
                            </p>

                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                                        <Mail size={20} />
                                    </div>
                                    <div>
                                        <span className="block text-xs text-indigo-200 font-bold uppercase tracking-wider mb-0.5">E-posta</span>
                                        <a href="mailto:kiyasgo@gmail.com" className="font-semibold hover:text-indigo-200 transition-colors">kiyasgo@gmail.com</a>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                                        <MessageSquare size={20} />
                                    </div>
                                    <div>
                                        <span className="block text-xs text-indigo-200 font-bold uppercase tracking-wider mb-0.5">Canlı Destek</span>
                                        <span className="font-semibold">Asistan üzerinden 7/24</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 opacity-80 text-xs">
                            © 2025 KıyasGO. İstanbul, Türkiye.
                        </div>
                    </div>

                    {/* Right: Form */}
                    <div className="md:w-3/5 p-8 md:p-12 relative">
                        {status === 'success' ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-slate-900 animate-in fade-in zoom-in duration-300">
                                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-6">
                                    <CheckCircle size={40} />
                                </div>
                                <h2 className="text-2xl font-bold mb-2">Mesajınız Alındı!</h2>
                                <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-xs">
                                    Bizimle iletişime geçtiğiniz için teşekkürler. En kısa sürede size dönüş yapacağız.
                                </p>
                                <button onClick={() => setStatus('idle')} className="text-indigo-600 font-bold hover:underline">
                                    Yeni Mesaj Gönder
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Adınız Soyadınız</label>
                                        <div className="relative">
                                            <input
                                                required
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                type="text"
                                                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                                placeholder="Adınız"
                                            />
                                            <User className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">E-posta Adresi</label>
                                        <div className="relative">
                                            <input
                                                required
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                type="email"
                                                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                                placeholder="ornek@email.com"
                                            />
                                            <Mail className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Konu</label>
                                    <input
                                        required
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        type="text"
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                        placeholder="Mesajınızın konusu"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Mesajınız</label>
                                    <textarea
                                        required
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        rows="4"
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                                        placeholder="Bize ne iletmek istersiniz?"
                                    ></textarea>
                                </div>

                                <button
                                    disabled={status === 'loading'}
                                    type="submit"
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {status === 'loading' ? (
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            Gönder <Send size={18} />
                                        </>
                                    )}
                                </button>

                                {status === 'error' && (
                                    <div className="flex items-center gap-2 text-rose-500 text-sm font-medium justify-center bg-rose-50 dark:bg-rose-900/20 p-3 rounded-lg">
                                        <AlertCircle size={16} />
                                        <span>Bir hata oluştu. Lütfen daha sonra tekrar deneyin.</span>
                                    </div>
                                )}
                            </form>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
