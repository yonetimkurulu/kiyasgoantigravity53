"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';

const globalContext = global;
if (!globalContext.KiyasGoFavoritesContext) {
    globalContext.KiyasGoFavoritesContext = createContext();
}

const FavoritesContext = globalContext.KiyasGoFavoritesContext;

// localStorage keys
const FAVORITES_CACHE_KEY = 'kiyasgo_favorites_cache';
const FAVORITES_LOCAL_KEY = 'kiyasgo_favorites_local'; // For non-authenticated users
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const FavoritesProvider = ({ children }) => {
    const { user, supabase, loading: authLoading } = useAuth();
    const [favorites, setFavorites] = useState(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);

    const lastFetchedUserId = useRef(null);
    const isFetching = useRef(false);

    // --- LOCAL STORAGE HELPERS (for non-authenticated users) ---
    const loadLocalFavorites = useCallback(() => {
        if (typeof window === 'undefined') return new Set();
        try {
            const stored = localStorage.getItem(FAVORITES_LOCAL_KEY);
            if (stored) {
                return new Set(JSON.parse(stored));
            }
        } catch (e) {
            console.warn('Failed to load local favorites:', e);
        }
        return new Set();
    }, []);

    const saveLocalFavorites = useCallback((favSet) => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.setItem(FAVORITES_LOCAL_KEY, JSON.stringify(Array.from(favSet)));
        } catch (e) {
            console.warn('Failed to save local favorites:', e);
        }
    }, []);

    // --- CACHE HELPERS (for authenticated users) ---
    const loadFromCache = useCallback((userId) => {
        if (typeof window === 'undefined') return null;
        try {
            const cached = localStorage.getItem(FAVORITES_CACHE_KEY);
            if (!cached) return null;

            const cacheData = JSON.parse(cached);
            if (cacheData.userId === userId && Date.now() - cacheData.timestamp < CACHE_DURATION) {
                return new Set(cacheData.productIds || []);
            }
            return null;
        } catch (e) {
            console.warn('Failed to load favorites cache:', e);
            return null;
        }
    }, []);

    const saveToCache = useCallback((productIds, userId) => {
        if (typeof window === 'undefined') return;
        try {
            const cacheData = {
                userId,
                productIds: Array.from(productIds),
                timestamp: Date.now()
            };
            localStorage.setItem(FAVORITES_CACHE_KEY, JSON.stringify(cacheData));
        } catch (e) {
            console.warn('Failed to save favorites cache:', e);
        }
    }, []);

    const clearCache = useCallback(() => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.removeItem(FAVORITES_CACHE_KEY);
        } catch (e) {
            // ignore
        }
    }, []);

    // --- SUPABASE FETCH (for authenticated users) ---
    const fetchFavorites = useCallback(async (userId) => {
        if (!userId || !supabase || isFetching.current) return;
        if (lastFetchedUserId.current === userId && isInitialized) return;

        isFetching.current = true;

        try {
            const { data, error } = await supabase
                .from('favorites')
                .select('product_id')
                .eq('user_id', userId);

            if (error) {
                console.error('Favorites fetch error:', error);
                return;
            }

            const newFavorites = new Set(data?.map(f => f.product_id) || []);

            // Merge with any local favorites that were saved while logged out
            const localFavs = loadLocalFavorites();
            if (localFavs.size > 0) {
                // Sync local favorites to Supabase
                for (const productId of localFavs) {
                    if (!newFavorites.has(productId)) {
                        newFavorites.add(productId);
                        // Also insert into Supabase silently
                        supabase.from('favorites')
                            .insert({ user_id: userId, product_id: productId })
                            .then(() => { })
                            .catch(() => { });
                    }
                }
                // Clear local storage after sync
                saveLocalFavorites(new Set());
            }

            setFavorites(newFavorites);
            saveToCache(newFavorites, userId);
            lastFetchedUserId.current = userId;
            setIsInitialized(true);
        } catch (err) {
            console.error('Favorites error:', err);
        } finally {
            isFetching.current = false;
            setIsLoading(false);
        }
    }, [supabase, saveToCache, isInitialized, loadLocalFavorites, saveLocalFavorites]);

    // --- INITIALIZE ---
    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            // Not logged in — load from local storage
            const localFavs = loadLocalFavorites();
            setFavorites(localFavs);
            clearCache();
            lastFetchedUserId.current = null;
            setIsInitialized(true);
            setIsLoading(false);
            return;
        }

        // User is logged in
        const cachedFavorites = loadFromCache(user.id);
        if (cachedFavorites && cachedFavorites.size > 0) {
            setFavorites(cachedFavorites);
            setIsLoading(false);
        }

        fetchFavorites(user.id);
    }, [user, authLoading, loadFromCache, clearCache, fetchFavorites, loadLocalFavorites]);

    // --- TOGGLE FAVORITE ---
    const toggleFavorite = useCallback(async (productId, showToast = null) => {
        const productIdStr = productId.toString();
        const isFav = favorites.has(productIdStr);

        // Optimistic update
        setFavorites(prev => {
            const next = new Set(prev);
            if (isFav) {
                next.delete(productIdStr);
            } else {
                next.add(productIdStr);
            }

            if (user) {
                // Save to cache for authenticated users
                saveToCache(next, user.id);
            } else {
                // Save to localStorage for non-authenticated users
                saveLocalFavorites(next);
            }

            return next;
        });

        // Show toast
        if (showToast) {
            showToast(isFav ? 'remove' : 'add');
        }

        // If user is logged in, sync with Supabase
        if (user && supabase) {
            try {
                if (isFav) {
                    const { error } = await supabase
                        .from('favorites')
                        .delete()
                        .eq('user_id', user.id)
                        .eq('product_id', productIdStr);

                    if (error) throw error;
                } else {
                    const { error } = await supabase
                        .from('favorites')
                        .insert({ user_id: user.id, product_id: productIdStr });

                    if (error) throw error;
                }

                return { success: true, isFavorite: !isFav };
            } catch (err) {
                console.error("Favorite toggle error:", err);

                // Rollback on error
                setFavorites(prev => {
                    const next = new Set(prev);
                    if (isFav) {
                        next.add(productIdStr);
                    } else {
                        next.delete(productIdStr);
                    }
                    if (user) saveToCache(next, user.id);
                    else saveLocalFavorites(next);
                    return next;
                });

                return { success: false, error: err };
            }
        }

        // Non-authenticated: always succeeds (localStorage only)
        return { success: true, isFavorite: !isFav };
    }, [user, favorites, supabase, saveToCache, saveLocalFavorites]);

    // Check if a product is favorite
    const isFavorite = useCallback((productId) => {
        return favorites.has(productId?.toString());
    }, [favorites]);

    // Get all favorite IDs
    const getFavoriteIds = useCallback(() => {
        return Array.from(favorites);
    }, [favorites]);

    // Force refresh from server
    const refreshFavorites = useCallback(async () => {
        if (user) {
            lastFetchedUserId.current = null;
            setIsLoading(true);
            await fetchFavorites(user.id);
        } else {
            const localFavs = loadLocalFavorites();
            setFavorites(localFavs);
        }
    }, [user, fetchFavorites, loadLocalFavorites]);

    const value = {
        favorites,
        isLoading,
        isFavorite,
        toggleFavorite,
        getFavoriteIds,
        refreshFavorites,
        isInitialized
    };

    return (
        <FavoritesContext.Provider value={value}>
            {children}
        </FavoritesContext.Provider>
    );
};

// Fallback implementation for when context is missing (webpack dual-module issue on Windows)
const createFallback = () => {
    const FALLBACK_KEY = 'kiyasgo_favorites_local';

    const getLocalFavs = () => {
        if (typeof window === 'undefined') return new Set();
        try {
            const stored = localStorage.getItem(FALLBACK_KEY);
            return stored ? new Set(JSON.parse(stored)) : new Set();
        } catch { return new Set(); }
    };

    const saveLocalFavs = (favSet) => {
        if (typeof window === 'undefined') return;
        try { localStorage.setItem(FALLBACK_KEY, JSON.stringify(Array.from(favSet))); } catch { }
    };

    return {
        favorites: getLocalFavs(),
        isLoading: false,
        isInitialized: true,
        isFavorite: (productId) => getLocalFavs().has(productId?.toString()),
        toggleFavorite: async (productId, showToast) => {
            const favs = getLocalFavs();
            const idStr = productId.toString();
            const isFav = favs.has(idStr);
            if (isFav) favs.delete(idStr); else favs.add(idStr);
            saveLocalFavs(favs);
            if (showToast) showToast(isFav ? 'remove' : 'add');
            return { success: true, isFavorite: !isFav };
        },
        getFavoriteIds: () => Array.from(getLocalFavs()),
        refreshFavorites: async () => { },
    };
};

export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (!context) {
        console.warn('useFavorites: Context missing, using localStorage fallback');
        return createFallback();
    }
    return context;
};
