'use client';

import React, { createContext, useContext, useState } from 'react';

const ComparisonContext = createContext();

export function ComparisonProvider({ children }) {
    const [selectedProducts, setSelectedProducts] = useState([]);

    const addToComparison = (product) => {
        if (selectedProducts.find(p => p.id === product.id)) {
            alert("Bu ürün zaten karşılaştırma listesinde.");
            return;
        }

        if (selectedProducts.length >= 3) {
            alert("En fazla 3 ürün karşılaştırabilirsiniz.");
            return;
        }

        if (selectedProducts.length > 0 && selectedProducts[0].category !== product.category) {
            alert("Sadece aynı kategorideki ürünleri karşılaştırabilirsiniz. Lütfen önce mevcut listeyi temizleyin.");
            return;
        }

        setSelectedProducts([...selectedProducts, product]);
    };

    const removeFromComparison = (productId) => {
        setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
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
