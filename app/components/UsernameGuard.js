"use client";

import { useAuth } from '@/app/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function UsernameGuard() {
    const { user, loading } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;
        if (!user) return; // Not logged in, no guard needed

        // If user is logged in but has no nickname
        if (!user.nickname) {
            // Allow access to the setup page itself
            if (pathname === '/kullanici-adi-belirle') return;

            // Allow access to logout related actions if any (though usually handled by button)
            // But block everything else
            console.log("UsernameGuard: No nickname found, redirecting to setup...");
            router.replace('/kullanici-adi-belirle');
        }
    }, [user, loading, pathname, router]);

    return null; // This component renders nothing
}
