
"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/app/utils/supabase/client';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const AuthProvider = ({ children, initialUser }) => {
    const supabase = createClient();
    const router = useRouter();
    const [user, setUser] = useState(initialUser);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // If we have a user but no profile data (checked by some field like full_name), fetch it
        // Or just let the subscription handle updates. 
        // For simplicity, let's keep the existing logic but respect initialUser.

        // We still need to listen for auth state changes (e.g. logout in another tab)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("Auth State Change:", event, session?.user?.email);
            if (session?.user) {
                // Fetch Profile Data on sign in or session refresh
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
                    router.refresh(); // Clear server cookies via Server Action or refresh
                }
            }
        });

        // Also fetch profile for initialUser if strictly needed immediately, 
        // but typically onAuthStateChange might fire 'INITIAL_SESSION' or similar, 
        // OR we just rely on the first render having the user.
        // Let's add a quick profile fetch if initialUser exists:
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

        return () => {
            subscription.unsubscribe();
        };
    }, [supabase, router, initialUser]);

    const signOut = async () => {
        await supabase.auth.signOut();
        window.location.href = '/'; // Hard reload to clear all state
    };

    return (
        <AuthContext.Provider value={{ user, signOut, loading, supabase }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
