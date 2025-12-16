'use client';

import React from 'react';
import Link from 'next/link';
import { Instagram, Mail, ExternalLink, Linkedin, ChevronRight } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-slate-950 text-white border-t border-slate-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

                    {/* 1. Logo & Hakkında */}
                    <div className="space-y-4">
                        <Link href="/" className="text-3xl font-black tracking-tight flex items-center gap-1">
                            <span className="text-indigo-500">Kıyas</span>
                            <span className="bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-transparent">GO</span>
                        </Link>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Yapay zeka destekli akıllı alışveriş asistanınız.
                            En iyi ürünleri saniyeler içinde karşılaştırın.
                        </p>
                    </div>

                    {/* 2. Kurumsal */}
                    <div>
                        <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-white">
                            Kurumsal
                        </h3>
                        <ul className="space-y-3 text-slate-400 text-sm">
                            <li>
                                <Link href="/kiyasgo-nedir" className="hover:text-indigo-400 transition-colors flex items-center gap-2">
                                    <ChevronRight size={14} className="text-slate-600" /> KıyasGO Nedir?
                                </Link>
                            </li>
                            <li>
                                <Link href="/hakkimizda" className="hover:text-indigo-400 transition-colors flex items-center gap-2">
                                    <ChevronRight size={14} className="text-slate-600" /> Hakkımızda
                                </Link>
                            </li>
                            <li>
                                <Link href="/bize-ulasin" className="hover:text-indigo-400 transition-colors flex items-center gap-2">
                                    <ChevronRight size={14} className="text-slate-600" /> Bize Ulaşın
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* 3. İletişim */}
                    <div>
                        <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-white">
                            İletişim
                        </h3>
                        <ul className="space-y-4 text-slate-400">
                            <li>
                                <a href="mailto:kiyasgo@gmail.com" className="flex items-center gap-3 hover:text-indigo-400 transition-colors group">
                                    <div className="bg-slate-900 p-2 rounded-lg group-hover:bg-indigo-500/10 transition-colors">
                                        <Mail size={18} />
                                    </div>
                                    <span className="text-sm">kiyasgo@gmail.com</span>
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* 4. Sosyal Medya */}
                    <div>
                        <h3 className="font-bold text-lg mb-6">Bizi Takip Edin</h3>
                        <div className="flex gap-4">
                            <a href="https://instagram.com/kiyasgo" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="bg-slate-900 p-3 rounded-xl hover:bg-gradient-to-tr hover:from-purple-600 hover:to-orange-500 hover:text-white transition-all duration-300 group">
                                <Instagram size={20} className="text-slate-400 group-hover:text-white" />
                            </a>

                            <a href="https://www.linkedin.com/company/k%C4%B1yasgo" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="bg-slate-900 p-3 rounded-xl hover:bg-[#0077b5] hover:text-white transition-all duration-300 group">
                                <Linkedin size={20} className="text-slate-400 group-hover:text-white" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                    <div className="flex flex-col md:flex-row items-center gap-2">
                        <p>© 2025 KıyasGO. Tüm hakları saklıdır.</p>
                        <span className="hidden md:inline text-slate-700">•</span>
                        <p className="text-slate-600">KıyasGO (kiyasgo.com) – internette fiyat karşılaştırmanın en akıllı yolu.</p>
                    </div>
                    <div className="flex gap-6">
                        <Link href="/gizlilik" className="hover:text-white transition-colors">Gizlilik Politikası</Link>
                        <Link href="/kullanim" className="hover:text-white transition-colors">Kullanım Şartları</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
