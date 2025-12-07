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

        // 3. CATEGORY MISMATCH CHECK
        if (selectedProducts.length > 0) {
            const currentCategory = (selectedProducts[0].category || '').toLowerCase().trim();
            const newCategory = (product.category || '').toLowerCase().trim();

            if (currentCategory && newCategory && currentCategory !== newCategory) {
                alert(`⚠️ Farklı kategoriler kıyaslanamaz!\nMevcut liste: ${selectedProducts[0].category}\nEklenmek istenen: ${product.category}\n\nLütfen önce listeyi temizleyin.`);
                return; // STOP execution
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
