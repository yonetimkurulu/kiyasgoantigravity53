"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/app/utils/supabase/client';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const AuthProvider = ({ children, initialUser }) => {
    // Memoize client to prevent "Multiple GoTrueClient instances" warning
    const [supabase] = useState(() => createClient());
    const router = useRouter();

    const [user, setUser] = useState(initialUser);
    // Start loading true if no initial user, to wait for client verification
    const [loading, setLoading] = useState(!initialUser);

    useEffect(() => {
        // Handle Initial Profile Fetch if initialUser exists (Server Side)
        if (initialUser) {
            const getProfile = async () => {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', initialUser.id)
                    .single();
                if (profile) {
                    setUser(prev => ({ ...prev, ...profile }));
                }
            }
            getProfile();
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                // Fetch Profile Data
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                setUser({ ...session.user, ...profile });
                if (event === 'SIGNED_IN') router.refresh();
            } else {
                setUser(null);
                if (event === 'SIGNED_OUT') {
                    router.refresh();
                }
            }
            // Auth check done
            setLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [supabase]);

    const signOut = async () => {
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error("Error signing out:", error);
        } finally {
            // Force reload to clear all client state/cookies
            window.location.href = '/';
        }
    };

    const refreshUser = async () => {
        if (!user) return;
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
        if (profile) {
            setUser(prev => ({ ...prev, ...profile }));
        }
    };

    return (
        <AuthContext.Provider value={{ user, signOut, loading, supabase, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
