'use client';

import React from 'react';
import Link from 'next/link';
import { Instagram, Mail, Twitter, Facebook, ExternalLink, Linkedin } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-slate-950 text-white border-t border-slate-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

                    {/* 1. Logo & Hakkında */}
                    <div className="space-y-4">
                        <Link href="/" className="text-3xl font-black tracking-tight flex items-center gap-1">
                            <span className="text-indigo-500">Kıyas</span>
                            <span className="bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-transparent">GO</span>
                        </Link>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                            Yapay zeka destekli akıllı alışveriş asistanınız.
                            En iyi ürünleri saniyeler içinde karşılaştırın ve doğru kararı verin.
                        </p>
                    </div>

                    {/* 2. Menü & İletişim */}
                    <div>
                        <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                            İletişim
                        </h3>
                        <ul className="space-y-4 text-slate-400">
                            <li>
                                <a href="mailto:kiyasgo@gmail.com" className="flex items-center gap-3 hover:text-indigo-400 transition-colors group">
                                    <div className="bg-slate-900 p-2 rounded-lg group-hover:bg-indigo-500/10 transition-colors">
                                        <Mail size={18} />
                                    </div>
                                    kiyasgo@gmail.com
                                </a>
                            </li>
                            <li>
                                <a href="mailto:kiyasgo@gmail.com?subject=KıyasGO%20İletişim%20Formu" className="flex items-center gap-3 hover:text-indigo-400 transition-colors group">
                                    <div className="bg-slate-900 p-2 rounded-lg group-hover:bg-indigo-500/10 transition-colors">
                                        <ExternalLink size={18} />
                                    </div>
                                    Bize Ulaşın Formu
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* 3. Sosyal Medya */}
                    <div>
                        <h3 className="font-bold text-lg mb-6">Bizi Takip Edin</h3>
                        <div className="flex gap-4">
                            <a href="https://instagram.com/kiyasgo" target="_blank" rel="noopener noreferrer" className="bg-slate-900 p-3 rounded-xl hover:bg-gradient-to-tr hover:from-purple-600 hover:to-orange-500 hover:text-white transition-all duration-300 group">
                                <Instagram size={24} className="text-slate-400 group-hover:text-white" />
                            </a>
                            <a href="#" className="bg-slate-900 p-3 rounded-xl hover:bg-sky-500 hover:text-white transition-all duration-300 group">
                                <Twitter size={24} className="text-slate-400 group-hover:text-white" />
                            </a>
                            <a href="#" className="bg-slate-900 p-3 rounded-xl hover:bg-blue-600 hover:text-white transition-all duration-300 group">
                                <Facebook size={24} className="text-slate-400 group-hover:text-white" />
                            </a>
                            <a href="https://www.linkedin.com/company/k%C4%B1yasgo" target="_blank" rel="noopener noreferrer" className="bg-slate-900 p-3 rounded-xl hover:bg-[#0077b5] hover:text-white transition-all duration-300 group">
                                <Linkedin size={24} className="text-slate-400 group-hover:text-white" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                    <p>© 2025 KıyasGO. Tüm hakları saklıdır.</p>
                    <div className="flex gap-6">
                        <Link href="/gizlilik" className="hover:text-white transition-colors">Gizlilik Politikası</Link>
                        <Link href="/kullanim" className="hover:text-white transition-colors">Kullanım Şartları</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
