
import React from 'react';
import Header from '@/app/components/Header';
import PopularBrands from '@/app/components/PopularBrands';
import { POPULAR_BRANDS } from '@/app/data';
import Footer from '@/app/components/Footer';

export const metadata = {
    title: 'Tüm Markalar - KıyasGO',
    description: 'KıyasGO üzerindeki tüm popüler markalar, kategoriler ve fırsatlar.',
};

export default function AllBrandsPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <div className="container mx-auto pt-4 px-4 bg-white dark:bg-slate-900 shadow-sm sticky top-0 z-30 mb-8 rounded-b-2xl">
                <Header activeTab="markalar" />
            </div>

            <main className="container mx-auto px-4 pb-20">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Tüm Markalar</h1>
                    <p className="text-slate-600 dark:text-slate-400">Aradığınız markayı bulun, en uygun fiyatları karşılaştırın.</p>
                </div>

                {/* 
                  Reusing PopularBrands component. 
                  We will refactor it to handle 'isFullPage' or similar prop to grid-layout ALL items.
                */}
                <PopularBrands
                    brands={POPULAR_BRANDS}
                    isFullList={true}
                />
            </main>

            <Footer />
        </div>
    );
}
