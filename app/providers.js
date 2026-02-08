'use client';

import { ComparisonProvider } from './context/ComparisonContext';
import { AuthProvider } from './context/AuthContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { Toaster } from 'react-hot-toast';

export function Providers({ children, user }) {
    return (
        <AuthProvider initialUser={user}>
            <FavoritesProvider>
                <ComparisonProvider>
                    {children}
                    <Toaster position="bottom-right" toastOptions={{ duration: 4000 }} />
                </ComparisonProvider>
            </FavoritesProvider>
        </AuthProvider>
    );
}
