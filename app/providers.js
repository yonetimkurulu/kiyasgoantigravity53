'use client';

import { ComparisonProvider } from './context/ComparisonContext';
import { AuthProvider } from './context/AuthContext';

export function Providers({ children }) {
    return (
        <AuthProvider>
            <ComparisonProvider>
                {children}
            </ComparisonProvider>
        </AuthProvider>
    );
}
