import React from 'react';
import { Sparkles, ShoppingBag, Zap, ShieldCheck } from 'lucide-react';

export const metadata = {
    title: 'Hakkımızda | KıyasGO - Alışverişin En Akıllı Hali',
    description: 'KıyasGO, yapay zeka teknolojisi ile milyonlarca ürünü analiz eden, kullanıcılarına en doğru fiyatı ve en iyi ürünü bulmayı hedefleyen yeni nesil bir karşılaştırma platformudur.',
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 md:py-20 font-sans">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">

                {/* Header Section */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
                        Hakkımızda
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        Alışveriş dünyasındaki karmaşayı netliğe kavuşturmak için buradayız.
                    </p>
                </div>

                {/* Brand Content */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 dark:border-slate-800 space-y-8">

                    <div className="prose prose-lg dark:prose-invert max-w-none">
                        <p className="font-medium text-xl text-slate-800 dark:text-slate-200">
                            KıyasGO, internette fiyat karşılaştırma yapmak isteyen kullanıcılar için geliştirilmiş yapay zeka destekli bir platformdur.
                        </p>
                        <p>
                            Günümüzde online alışveriş yaparken binlerce seçenek arasında kaybolmak çok kolay. <strong className="text-indigo-600 dark:text-indigo-400">KıyasGO</strong> olarak amacımız, bu süreci sizin için en basit, en hızlı ve en karlı hale getirmektir.
                        </p>
                        <p>
                            Biz sadece bir fiyat karşılaştırma sitesi değiliz; aynı zamanda alışveriş alışkanlıklarınızı analiz eden ve size özel öneriler sunan akıllı bir asistanız. Teknolojiyi insanların hayatını kolaylaştırmak için kullanıyoruz.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                            <Sparkles className="text-amber-500 mb-4" size={32} />
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Yapay Zeka Destekli</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm">
                                Gelişmiş algoritmalarımız ile ürünleri sadece fiyatına göre değil, özelliklerine ve kullanıcı yorumlarına göre de analiz ediyoruz.
                            </p>
                        </div>
                        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                            <ShoppingBag className="text-indigo-500 mb-4" size={32} />
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Akıllı Karşılaştırma</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm">
                                <strong className="text-indigo-600">KıyasGO fiyat karşılaştırma</strong> motoru, sizin için en uygun ürünü saniyeler içinde bulur.
                            </p>
                        </div>
                        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                            <Zap className="text-rose-500 mb-4" size={32} />
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Hızlı ve Kolay</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm">
                                Karmaşık arayüzlerden uzak, sade ve kullanıcı dostu tasarımımızla aradığınızı anında bulmanızı sağlıyoruz.
                            </p>
                        </div>
                        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                            <ShieldCheck className="text-emerald-500 mb-4" size={32} />
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Güvenilir Bilgi</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm">
                                Verilerimizi sürekli güncel tutarak size en doğru fiyat ve stok bilgisini sunuyoruz.
                            </p>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
