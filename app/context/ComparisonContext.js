'use client';

import React, { createContext, useContext, useState } from 'react';

const ComparisonContext = createContext();

export function ComparisonProvider({ children }) {
    const [selectedProducts, setSelectedProducts] = useState([]);

    const addToComparison = (product) => {
        // 1. DUPLICATE CHECK
        const isDuplicate = selectedProducts.some(p =>
            String(p.id).toLowerCase() === String(product.id).toLowerCase()
        );

        if (isDuplicate) {
            alert("⚠️ Bu ürün zaten karşılaştırma listenizde ekli!");
            return; // STOP execution
        }

        // 2. MAX LIMIT CHECK
        if (selectedProducts.length >= 3) {
            alert("⚠️ En fazla 3 ürünü aynı anda kıyaslayabilirsiniz.");
            return; // STOP execution
        }

        // 3. CATEGORY & SUBCATEGORY MISMATCH CHECK
        if (selectedProducts.length > 0) {
            const p1 = selectedProducts[0];

            const currentCategory = (p1.category || '').toLowerCase().trim();
            const newCategory = (product.category || '').toLowerCase().trim();

            const currentSub = (p1.subcategory || '').toLowerCase().trim();
            const newSub = (product.subcategory || '').toLowerCase().trim();

            // 1. Main Category Check
            if (currentCategory && newCategory && currentCategory !== newCategory) {
                alert(`⚠️ Farklı ana kategoriler kıyaslanamaz!\nMevcut Liste: ${p1.category}\nEklenen: ${product.category}\n\nLütfen önce listeyi temizleyin.`);
                return;
            }

            // 2. Subcategory Check (Strict)
            // If both have subcategories, they MUST match.
            if (currentSub && newSub && currentSub !== newSub) {
                alert(`⚠️ Farklı ürün tipleri kıyaslanamaz!\nMevcut Liste: ${p1.subcategory.replace(/-/g, ' ').toUpperCase()}\nEklenen: ${product.subcategory.replace(/-/g, ' ').toUpperCase()}\n\nÖrn: Telefon ile Tablet kıyaslanamaz.`);
                return;
            }
        }

        // If all checks pass, add the product
        setSelectedProducts(prev => [...prev, product]);
    };

    const removeFromComparison = (productId) => {
        setSelectedProducts(prev => prev.filter(p => String(p.id).toLowerCase() !== String(productId).toLowerCase()));
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
