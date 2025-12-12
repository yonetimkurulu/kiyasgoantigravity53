'use client';

import { ComparisonProvider } from './context/ComparisonContext';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

export function Providers({ children, user }) {
    return (
        <AuthProvider initialUser={user}>
            <ComparisonProvider>
                {children}
                <Toaster position="bottom-right" toastOptions={{ duration: 4000 }} />
            </ComparisonProvider>
        </AuthProvider>
    );
}
