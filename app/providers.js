'use client';

import { ComparisonProvider } from './context/ComparisonContext';
import { AuthProvider } from './context/AuthContext';

export function Providers({ children, user }) {
    return (
        <AuthProvider initialUser={user}>
            <ComparisonProvider>
                {children}
            </ComparisonProvider>
        </AuthProvider>
    );
}
