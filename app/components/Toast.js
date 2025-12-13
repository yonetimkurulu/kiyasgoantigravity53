"use client";
import React, { useEffect } from 'react';
import { Heart, CheckCircle, AlertCircle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border ${type === 'success'
                    ? 'bg-white dark:bg-slate-900 border-rose-100 dark:border-rose-900/30 text-slate-800 dark:text-white'
                    : 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
                }`}>
                {type === 'success' ? (
                    <div className="p-2 bg-rose-50 dark:bg-rose-900/30 rounded-full text-rose-500 animate-pulse">
                        <Heart size={20} fill="currentColor" />
                    </div>
                ) : (
                    <AlertCircle size={20} />
                )}
                <div>
                    <h4 className="font-bold text-sm">{type === 'success' ? 'Harika!' : 'Hata'}</h4>
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
