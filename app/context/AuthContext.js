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
        // 1. Check active session immediately to sync state if listener lags
        const checkSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    // Only update if we are not already consistent OR if we identify missing profile data
                    if (!user || user.id !== session.user.id || (session.user.id === user.id && !user.nickname && !user.full_name)) {
                        // Fetch profile
                        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
                        // Merge session user with profile data
                        const mergedUser = { ...session.user, ...profile };

                        // Avoid infinite loops: only update if data is actually different
                        if (JSON.stringify(mergedUser) !== JSON.stringify(user)) {
                            setUser(mergedUser);
                        }
                    }
                } else if (!initialUser) {
                    // No session and no initial server user -> confirm we are logged out
                    setUser(null);
                }
            } catch (error) {
                console.error("Session check error:", error);
            } finally {
                setLoading(false);
            }
        };

        checkSession();

        // 2. Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            // console.log("Auth Event:", event);
            if (session?.user) {
                // Determine if we need to fetch profile (if new user or just signed in)
                if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
                    // Fetch profile
                    const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
                    const mergedUser = { ...session.user, ...profile };

                    if (JSON.stringify(mergedUser) !== JSON.stringify(user)) {
                        setUser(mergedUser);
                        if (event === 'SIGNED_IN') router.refresh();
                    }
                }
            } else {
                // If signed out explicitly
                if (event === 'SIGNED_OUT') {
                    setUser(null);
                    router.refresh();
                    router.push('/'); // Go home on sign out
                }
            }
            setLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []); // Run once on mount

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
