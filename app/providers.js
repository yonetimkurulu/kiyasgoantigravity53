'use client';

import { ComparisonProvider } from './context/ComparisonContext';

export function Providers({ children }) {
    return (
        <ComparisonProvider>
            {children}
        </ComparisonProvider>
    );
}
