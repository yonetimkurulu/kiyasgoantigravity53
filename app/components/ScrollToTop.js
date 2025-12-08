"use client";
import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

export default function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);

    // Toggle visibility based on scroll position
    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);

        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    if (!isVisible) {
        return null;
    }

    return (
        <button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-slate-900/50 dark:bg-white/50 text-white dark:text-slate-900 backdrop-blur-sm hover:bg-slate-900 hover:text-white dark:hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 group"
            aria-label="Yukarı Çık"
        >
            <ChevronUp size={24} className="group-hover:scale-110 transition-transform" />
        </button>
    );
}
