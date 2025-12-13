"use client";
import React, { useEffect } from 'react';
import { Heart, CheckCircle, AlertCircle, X, Trash2 } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    // Handle Icon and Color logic
    let icon = <Heart size={20} fill="currentColor" />;
    let colorClass = "bg-white dark:bg-slate-900 border-rose-100 dark:border-rose-900/30 text-slate-800 dark:text-white";
    let iconBg = "p-2 bg-rose-50 dark:bg-rose-900/30 rounded-full text-rose-500 animate-pulse";
    let title = "Harika!";

    if (type === 'remove' || type === 'error') {
        icon = <Trash2 size={20} />;
        colorClass = "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white";
        iconBg = "p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500";
        title = type === 'remove' ? "Kaldırıldı" : "Hata";
    }

    return (
        <div className="fixed bottom-8 right-8 z-[100] animate-in slide-in-from-right-5 fade-in duration-300">
            <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border ${colorClass}`}>
                <div className={iconBg}>
                    {icon}
                </div>
                <div>
                    <h4 className="font-bold text-sm">{title}</h4>
                    <p className="text-xs opacity-90 font-medium">{message}</p>
                </div>
                <button onClick={onClose} className="ml-4 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                    <X size={16} className="text-slate-400" />
                </button>
            </div>
        </div>
    );
};

export default Toast;
