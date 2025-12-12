
"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/app/utils/supabase/client';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const supabase = createClient();
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getUser = async () => {
            console.log("AuthContext: Checking session...");
            const { data: { session }, error } = await supabase.auth.getSession();

            console.log("AuthContext: Session result:", { session, error });

            if (session?.user) {
                // Fetch Profile Data
                console.log("AuthContext: User found, fetching profile...", session.user.id);
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                setUser({ ...session.user, ...profile });
            } else {
                console.log("AuthContext: No user found in session.");
                setUser(null);
            }
            setLoading(false);
        };

        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
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
            setLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
        router.refresh(); // Clear cookies on server
    };

    return (
        <AuthContext.Provider value={{ user, signOut, loading, supabase }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
