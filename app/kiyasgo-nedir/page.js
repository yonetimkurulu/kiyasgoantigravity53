import React from 'react';
import Link from 'next/link';
import { ArrowRight, Search, BarChart2, Zap } from 'lucide-react';

export const metadata = {
    title: 'KıyasGO Nedir? | Akıllı Fiyat Karşılaştırma',
    description: 'KıyasGO nedir? İnternetteki binlerce ürünü saniyeler içinde analiz edip en uygun fiyatı ve en doğru ürünü bulmanızı sağlayan yapay zeka destekli bir platformdur.',
};

export default function WhatIsPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 font-sans">

            {/* Hero Section */}
            <div className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 py-16 md:py-24">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
                        KıyasGO Nedir?
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
                        İnternette alışverişin en akıllı, en hızlı ve en karlı yolu.
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-16 md:py-24 space-y-20">

                {/* Main Content */}
                <section className="prose prose-lg dark:prose-invert max-w-none">
                    <p className="lead text-xl md:text-2xl font-medium text-slate-800 dark:text-slate-200">
                        <strong className="text-indigo-600 dark:text-indigo-400">KıyasGO</strong>, kullanıcıların internet üzerindeki milyonlarca ürün arasından kendileri için en uygun olanı en iyi fiyata bulmalarını sağlayan, yapay zeka destekli yeni nesil bir alışveriş asistanıdır.
                    </p>
                    <p>
                        Geleneksel fiyat karşılaştırma sitelerinden farklı olarak, KıyasGO sadece fiyatları listelemez; ürün özelliklerini, kullanıcı yorumlarını ve fiyat geçmişini analiz ederek size "gerçekten" iyi bir fırsat olup olmadığını söyler.
                    </p>
                </section>

                {/* Features Grid */}
                <section className="grid md:grid-cols-3 gap-8">
                    <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-3xl">
                        <div className="bg-indigo-100 dark:bg-indigo-900/50 w-12 h-12 flex items-center justify-center rounded-2xl text-indigo-600 mb-6">
                            <Search size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Akıllı Arama</h3>
                        <p className="text-slate-600 dark:text-slate-400">
                            "KıyasGO fiyat karşılaştırma" motoru, yazdığınız ürünü saniyeler içinde tüm pazar yerlerinde tarar.
                        </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-3xl">
                        <div className="bg-amber-100 dark:bg-amber-900/50 w-12 h-12 flex items-center justify-center rounded-2xl text-amber-600 mb-6">
                            <BarChart2 size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Derin Analiz</h3>
                        <p className="text-slate-600 dark:text-slate-400">
                            Ürünlerin teknik özelliklerini yan yana getirir ve hangisinin ihtiyacınıza uygun olduğunu gösterir.
                        </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-3xl">
                        <div className="bg-rose-100 dark:bg-rose-900/50 w-12 h-12 flex items-center justify-center rounded-2xl text-rose-600 mb-6">
                            <Zap size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Hızlı Sonuç</h3>
                        <p className="text-slate-600 dark:text-slate-400">
                            <Link href="/" className="text-indigo-600 hover:underline">KıyasGO alışveriş asistanı</Link> ile vakit kaybetmeden doğru kararı verin.
                        </p>
                    </div>
                </section>

                {/* Call to Action */}
                <section className="bg-indigo-600 rounded-3xl p-8 md:p-16 text-center text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-4xl font-black mb-6">Alışverişe Başlamaya Hazır Mısın?</h2>
                        <p className="text-indigo-100 text-lg mb-8 max-w-lg mx-auto">
                            Hemen arama yap, en iyi fiyatları ve ürün özelliklerini tek ekranda gör.
                        </p>
                        <Link href="/" className="inline-flex items-center gap-2 bg-white text-indigo-600 px-8 py-4 rounded-xl font-bold hover:bg-indigo-50 transition-colors">
                            Hemen Keşfet <ArrowRight size={20} />
                        </Link>
                    </div>
                    {/* Background Pattern */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white rounded-full blur-3xl"></div>
                    </div>
                </section>

            </div>
        </div>
    );
}
