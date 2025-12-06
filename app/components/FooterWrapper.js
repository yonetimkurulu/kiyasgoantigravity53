'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function FooterWrapper() {
    const pathname = usePathname();

    // Kıyaslama sayfasında Footer'ı gizle
    // /kiyasgo/kiyasla sayfası tam eşleşme veya alt sayfaları olabilir
    if (pathname && pathname.includes('/kiyasgo/kiyasla')) {
        return null;
    }

    return <Footer />;
}
