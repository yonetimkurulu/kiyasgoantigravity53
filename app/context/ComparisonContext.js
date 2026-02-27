'use client';

import React, { createContext, useContext, useState } from 'react';
import toast from 'react-hot-toast';

const ComparisonContext = createContext();

export function ComparisonProvider({ children }) {
    const [selectedProducts, setSelectedProducts] = useState([]);

    const addToComparison = (product) => {
        // 1. DUPLICATE CHECK
        const isDuplicate = selectedProducts.some(p => {
            const pId = String(p.slug || p.id || '').toLowerCase();
            const newItemId = String(product.slug || product.id || '').toLowerCase();
            if (pId && newItemId && pId === newItemId) return true;
            if (p.name && product.name && p.name.trim().toLowerCase() === product.name.trim().toLowerCase()) return true;
            return false;
        });

        if (isDuplicate) {
            toast("Bu ürün zaten listenizde!", {
                icon: '⚠️',
                style: {
                    border: '1px solid #f59e0b',
                    padding: '16px',
                    color: '#92400e',
                    backgroundColor: '#fef3c7',
                },
            });
            return;
        }

        // 2. MAX LIMIT CHECK
        if (selectedProducts.length >= 3) {
            toast("En fazla 3 ürün kıyaslanabilir.", {
                icon: '⚠️',
                style: {
                    border: '1px solid #f59e0b',
                    padding: '16px',
                    color: '#92400e',
                    backgroundColor: '#fef3c7',
                },
            });
            return;
        }

        // 3. CATEGORY CHECK
        if (selectedProducts.length > 0) {
            const p1 = selectedProducts[0];
            const currentSub = (p1.subcategory || '').toLowerCase().trim();
            const newSub = (product.subcategory || '').toLowerCase().trim();

            if (currentSub && newSub && currentSub !== newSub) {
                toast(
                    (t) => (
                        <div className="flex flex-col gap-1">
                            <span className="font-bold">Farklı ürünler kıyaslanamaz!</span>
                            <span className="text-xs">Mevcut: {p1.subcategory?.toUpperCase()}</span>
                            <span className="text-xs">Eklenen: {product.subcategory?.toUpperCase()}</span>
                        </div>
                    ),
                    {
                        icon: '⚠️',
                        style: {
                            border: '1px solid #f59e0b', // Amber-500
                            padding: '12px',
                            color: '#78350f', // Amber-900
                            backgroundColor: '#fffbeb', // Amber-50
                        },
                    }
                );
                return;
            }
        }

        // SUCCESS
        setSelectedProducts(prev => [...prev, product]);
        toast.success("Listeye Eklendi", {
            position: 'bottom-right',
            duration: 2000,
            style: {
                background: '#10B981',
                color: '#fff'
            }
        });
    };

    const removeFromComparison = (productIdentifier) => {
        const target = String(productIdentifier || '').toLowerCase();
        setSelectedProducts(prev => prev.filter(p => {
            const pId = String(p.id || '').toLowerCase();
            const pSlug = String(p.slug || '').toLowerCase();
            const pName = String(p.name || '').toLowerCase();
            return pId !== target && pSlug !== target && pName !== target;
        }));
    };

    const clearComparison = () => {
        setSelectedProducts([]);
    };

    return (
        <ComparisonContext.Provider value={{ selectedProducts, addToComparison, removeFromComparison, clearComparison }}>
            {children}
        </ComparisonContext.Provider>
    );
}

export function useComparison() {
    return useContext(ComparisonContext);
}
