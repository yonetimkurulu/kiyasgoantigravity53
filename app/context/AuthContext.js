"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/app/utils/supabase/client';
import { useRouter, usePathname } from 'next/navigation';

const AuthContext = createContext();

export const AuthProvider = ({ children, initialUser }) => {
    // Memoize client to prevent "Multiple GoTrueClient instances" warning
    const [supabase] = useState(() => createClient());
    const router = useRouter();
    const pathname = usePathname();

    const [user, setUser] = useState(initialUser);
    // Start loading true if no initial user, to wait for client verification
    const [loading, setLoading] = useState(!initialUser);

    useEffect(() => {
        // 1. Check active session immediately to sync state if listener lags
        const checkSession = async () => {
            // Don't set loading on every route change - only initial mount needs loading
            try {
                const { data: { user: freshUser }, error: userError } = await supabase.auth.getUser();
                const { data: { session } } = await supabase.auth.getSession();

                // Use fresh server user if available, otherwise session user, otherwise state user
                const effectiveUser = freshUser || session?.user || user;

                if (effectiveUser) {
                    // Check if we need to sync profile data.
                    const needsProfileSync = !user ||
                        user.id !== effectiveUser.id ||
                        (!user.nickname) ||
                        (!user.avatar_url);

                    if (needsProfileSync) {
                        try {
                            // Fetch profile
                            const { data: profile } = await supabase.from('profiles').select('*').eq('id', effectiveUser.id).single();

                            // Merge user data
                            const mergedUser = {
                                ...effectiveUser,
                                ...profile,
                                full_name: profile?.full_name || effectiveUser.user_metadata?.full_name || effectiveUser.email?.split('@')[0],
                                nickname: profile?.nickname || effectiveUser.user_metadata?.nickname,
                                avatar_url: profile?.avatar_url || effectiveUser.user_metadata?.avatar_url
                            };

                            // Check difference
                            const currentStr = JSON.stringify({ id: user?.id, nick: user?.nickname, avatar: user?.avatar_url });
                            const newStr = JSON.stringify({ id: mergedUser.id, nick: mergedUser.nickname, avatar: mergedUser.avatar_url });

                            if (currentStr !== newStr || !user) {
                                console.log("AuthContext: Syncing user profile data...", mergedUser.nickname);
                                setUser(mergedUser);
                            }
                        } catch (err) {
                            console.error("Profile fetch failed:", err);
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


        // Run immediately on mount AND when pathname changes
        checkSession();

        // 2. Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            // console.log("Auth Event:", event);
            if (session?.user) {
                // Determine if we need to fetch profile (if new user or just signed in)
                if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
                    // Fetch profile
                    const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
                    const mergedUser = {
                        ...session.user,
                        ...profile,
                        nickname: profile?.nickname || session.user.user_metadata?.nickname || session.user.nickname,
                        avatar_url: profile?.avatar_url || session.user.user_metadata?.avatar_url || session.user.avatar_url
                    };

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
    }, [pathname]); // Check session on route change

    const signOut = async () => {
        try {
            // 1. Supabase signOut
            await supabase.auth.signOut();

            // 2. Clear state immediately
            setUser(null);

            // 3. Clear ALL Supabase cookies manually (mobile fix)
            const cookies = document.cookie.split(';');
            for (let cookie of cookies) {
                const cookieName = cookie.split('=')[0].trim();
                // Clear cookies with various path/domain combinations
                document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
                document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname};`;
                document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${window.location.hostname};`;
            }

            // 4. Clear localStorage Supabase keys
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (key.includes('supabase') || key.includes('sb-') || key.includes('kiyasgo'))) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));

            // 5. Clear sessionStorage
            sessionStorage.clear();

        } catch (error) {
            console.error("Error signing out:", error);
        } finally {
            // Force hard reload to clear all state
            window.location.href = '/?logout=' + Date.now();
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
            setUser(prev => {
                const newState = {
                    ...prev,
                    ...profile,
                    nickname: profile?.nickname || prev?.user_metadata?.nickname || prev?.nickname,
                    avatar_url: profile?.avatar_url || prev?.user_metadata?.avatar_url || prev?.avatar_url
                };
                if (JSON.stringify(prev) === JSON.stringify(newState)) return prev;
                return newState;
            });
        }
    };

    return (
        <AuthContext.Provider value={{ user, signOut, loading, supabase, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
