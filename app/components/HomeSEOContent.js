'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

const HomeSEOContent = () => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="w-full mt-12 mb-8 bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 md:p-8 border border-slate-100 dark:border-slate-800">
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-indigo-500" />
                KıyasGO: Yapay Zeka Destekli Akıllı Alışveriş Asistanınız
            </h2>

            <div className={`relative transition-all duration-500 overflow-hidden ${isExpanded ? 'max-h-[3000px]' : 'max-h-[160px] md:max-h-[140px]'}`}>

                <div className="space-y-6 text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                    <p>
                        Online alışveriş dünyasında milyonlarca ürün ve değişken fiyatlar arasında kaybolmadan, en doğru kararı vermek artık çok daha kolay. KıyasGO, klasik fiyat karşılaştırma sitelerinden farklı olarak, yapay zeka teknolojisiyle güçlendirilmiş altyapısı sayesinde size sadece en ucuz ürünü değil, ihtiyacınıza en uygun ürünü en doğru zamanda almanızı sağlayan yeni nesil bir alışveriş rehberidir.
                    </p>

                    <div>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
                            KıyasGO Nedir ve Nasıl Çalışır?
                        </h3>
                        <p>
                            KıyasGO, yüzlerce mağazadaki fiyatları saniyeler içinde tarayarak size en uygun seçenekleri sunar. Ancak bizi farklı kılan, sadece rakamları kıyaslamamız değildir. Gelişmiş yapay zeka algoritmalarımız, sizinle doğal bir dilde konuşarak ihtiyaçlarınızı anlar, teknik terimler arasında boğulmadan aradığınız ürüne ulaşmanızı sağlar. "Oyun bilgisayarı istiyorum" dediğinizde, KıyasGO sizi binlerce seçenekle baş başa bırakmaz; bütçenize, oynayacağınız oyunlara ve performans beklentinize göre nokta atışı öneriler sunar.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
                            Yorum Kirliliğine Son: Yapay Zeka Destekli Yorum Analizi
                        </h3>
                        <p>
                            Bir ürün almadan önce yüzlerce yorumu okuyup, hangisinin gerçek hangisinin yanıltıcı olduğunu ayırt etmeye çalışmak zaman alıcı ve yorucudur. KıyasGO, ilgilendiğiniz ürün hakkındaki binlerce kullanıcı yorumunu sizin yerinize okur ve analiz eder. Yapay zeka asistanımız, bu yorumlardan süzdüğü "En Beğenilen Özellikler" ve "Kronik Sorunlar" gibi kritik bilgileri size kısa, anlaşılır özetler halinde sunar. Böylece saatlerce araştırma yapmak yerine, saniyeler içinde ürünün gerçek kullanıcı deneyimine hakim olursunuz.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
                            Fiyatı Takip Edin, Doğru Zamanda Alın
                        </h3>
                        <p>
                            İnternet alışverişinde fiyatlar anlık olarak değişebilir. KıyasGO’nun akıllı zamanlama özelliği, sadece şu anki fiyatı göstermekle kalmaz, fiyat geçmişi verilerini analiz ederek size bir projeksiyon sunar. Ürünü "Şimdi Al" mı yoksa "İndirimi Bekle" mi kararı vermenizde size rehberlik eder. Bütçenizi korumak için mağaza mağaza gezmenize gerek kalmadan, tüm fırsatları tek ekranda görebilirsiniz.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
                            Kişiselleştirilmiş Alışveriş Deneyimi
                        </h3>
                        <p>
                            Her kullanıcının önceliği farklıdır. Kimisi için kargo hızı, kimisi için en düşük fiyat, kimisi içinse satıcı puanı önemlidir. KıyasGO, sizin geçmiş tercihlerinizi ve aramalarınızı öğrenen akıllı yapısıyla, size özel bir alışveriş deneyimi kurgular. Statik listeler yerine, sizin dilinizden anlayan ve her kullanımda daha da akıllanan bir asistanla alışveriş yapmanın konforunu yaşarsınız.
                        </p>
                    </div>

                    <p className="font-medium text-slate-800 dark:text-slate-300">
                        KıyasGO ile online alışverişte kontrol tamamen sizde. Aradığınızı saniyeler içinde bulun, yapay zeka analizleriyle güvenle karar verin ve en iyi fiyatla satın alın.
                    </p>
                </div>

                {/* Fade Out Effect (Only visible when collapsed) */}
                {!isExpanded && (
                    <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-50 dark:from-slate-900 via-slate-50/90 dark:via-slate-900/90 to-transparent pointer-events-none" />
                )}
            </div>

            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-6 flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors mx-auto px-6 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40"
            >
                {isExpanded ? (
                    <>
                        Daha Az Göster <ChevronUp className="w-4 h-4" />
                    </>
                ) : (
                    <>
                        Daha Fazla Göster <ChevronDown className="w-4 h-4" />
                    </>
                )}
            </button>
        </div>
    );
};

export default HomeSEOContent;
