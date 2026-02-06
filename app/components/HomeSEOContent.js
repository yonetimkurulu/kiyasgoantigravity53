'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const HomeSEOContent = () => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="w-full mt-12 mb-8 bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 md:p-8 border border-slate-100 dark:border-slate-800">
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">
                KıyasGO: En Doğru Fiyatı Bulmanın En Akıllı Yolu
            </h2>

            <div className={`relative transition-all duration-500 overflow-hidden ${isExpanded ? 'max-h-[2000px]' : 'max-h-[120px] md:max-h-[100px]'}`}>

                <div className="space-y-4 text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                    <p>
                        KıyasGO, online alışveriş deneyiminizi en üst seviyeye taşımak için geliştirilmiş, yapay zeka destekli yeni nesil bir fiyat karşılaştırma ve alışveriş rehberidir. Milyonlarca ürünü ve binlerce mağazayı saniyeler içinde tarayarak size en uygun fiyatı sunmayı hedefler. Akıllı algoritmaları sayesinde sadece fiyatları değil, ürün özelliklerini, kargo seçeneklerini ve mağaza puanlarını da analiz ederek en doğru kararı vermenize yardımcı olur.
                    </p>

                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mt-6">
                        KıyasGO ile Nasıl Tasarruf Edersiniz?
                    </h3>
                    <p>
                        İnternet alışverişinde fiyatlar anlık olarak değişebilir. KıyasGO, sizin yerinize tüm pazar yerlerini (Trendyol, Hepsiburada, Amazon, N11 vb.) anlık olarak takip eder. Aradığınız bir cep telefonu, bilgisayar, beyaz eşya veya kozmetik ürünü olsun; KıyasGO tüm seçenekleri tek bir ekranda listeler. Böylece mağaza mağaza gezmek zorunda kalmadan, en ucuz fiyatın nerede olduğunu anında görebilirsiniz.
                    </p>

                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mt-6">
                        Akıllı Fiyat Analizi ve Geçmişi
                    </h3>
                    <p>
                        Bir ürünün şimdiki fiyatı gerçekten ucuz mu? KıyasGO'nun fiyat analizi grafikleri sayesinde ürünlerin geçmişe dönük fiyat değişimlerini inceleyebilirsiniz. İndirim dönemlerinde (Black Friday, Sevgililer Günü, Yılbaşı) yapılan indirimlerin gerçek olup olmadığını bu sayede kolayca anlayabilirsiniz. "Fiyat Düştü" etiketli ürünleri takip ederek gerçek fırsatları yakalayabilirsiniz.
                    </p>

                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mt-6">
                        Kategori Çeşitliliği ve Rehberlik
                    </h3>
                    <p>
                        Elektronikten modaya, anne-bebek ürünlerinden süpermarkete kadar geniş bir yelpazede hizmet sunuyoruz. Hangi ürünü alacağınıza karar veremediyseniz, detaylı ürün incelemelerimiz ve karşılaştırma özelliklerimiz size rehberlik eder. İhtiyacınıza en uygun özellikleri belirleyin, KıyasGO size en mantıklı seçenekleri sunsun.
                    </p>

                    <p className="mt-4">
                        Alışveriş yapmadan önce mutlaka KıyasGO'ya uğrayın, bütçenizi koruyun ve en akıllı alışveriş deneyimini yaşayın. KıyasGO ile aradığınız her şey, en iyi fiyatla parmaklarınızın ucunda.
                    </p>
                </div>

                {/* Fade Out Effect (Only visbile when collapsed) */}
                {!isExpanded && (
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-50 dark:from-slate-900 via-slate-50/80 dark:via-slate-900/80 to-transparent pointer-events-none" />
                )}
            </div>

            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-4 flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors mx-auto"
            >
                {isExpanded ? (
                    <>
                        Daha Az Göster <ChevronUp className="w-4 h-4" />
                    </>
                ) : (
                    <>
                        Tümünü Göster <ChevronDown className="w-4 h-4" />
                    </>
                )}
            </button>
        </div>
    );
};

export default HomeSEOContent;
