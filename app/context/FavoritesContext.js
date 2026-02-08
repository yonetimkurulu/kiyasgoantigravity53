"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext();

// localStorage key for favorites cache
const FAVORITES_CACHE_KEY = 'kiyasgo_favorites_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const FavoritesProvider = ({ children }) => {
    const { user, supabase, loading: authLoading } = useAuth();
    const [favorites, setFavorites] = useState(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);

    // Track if we've fetched for this user to prevent duplicate fetches
    const lastFetchedUserId = useRef(null);
    const isFetching = useRef(false);

    // Helper: Load from localStorage cache
    const loadFromCache = useCallback((userId) => {
        if (typeof window === 'undefined') return null;
        try {
            const cached = localStorage.getItem(FAVORITES_CACHE_KEY);
            if (!cached) return null;

            const cacheData = JSON.parse(cached);
            // Only use cache if it's for the same user and fresh
            if (cacheData.userId === userId && Date.now() - cacheData.timestamp < CACHE_DURATION) {
                return new Set(cacheData.productIds || []);
            }
            return null;
        } catch (e) {
            console.warn('Failed to load favorites cache:', e);
            return null;
        }
    }, []);

    // Helper: Save to localStorage cache
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

    // Clear cache (for logout)
    const clearCache = useCallback(() => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.removeItem(FAVORITES_CACHE_KEY);
        } catch (e) {
            // ignore
        }
    }, []);

    // Fetch favorites from Supabase
    const fetchFavorites = useCallback(async (userId) => {
        if (!userId || !supabase || isFetching.current) return;

        // Prevent duplicate fetch for same user
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
    }, [supabase, saveToCache, isInitialized]);

    // Initialize favorites when user changes
    useEffect(() => {
        // Wait for auth to finish loading
        if (authLoading) return;

        if (!user) {
            // User logged out - clear everything
            setFavorites(new Set());
            clearCache();
            lastFetchedUserId.current = null;
            setIsInitialized(false);
            setIsLoading(false);
            return;
        }

        // User is logged in
        // 1. Load from cache immediately for instant UI
        const cachedFavorites = loadFromCache(user.id);
        if (cachedFavorites && cachedFavorites.size > 0) {
            setFavorites(cachedFavorites);
            setIsLoading(false);
        }

        // 2. Fetch fresh data from Supabase (will update if different)
        fetchFavorites(user.id);

    }, [user, authLoading, loadFromCache, clearCache, fetchFavorites]);

    // Toggle favorite (add/remove)
    const toggleFavorite = useCallback(async (productId, showToast = null) => {
        if (!user) {
            // Return false to indicate user needs to login
            return { success: false, needsAuth: true };
        }

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
            // Update cache immediately
            saveToCache(next, user.id);
            return next;
        });

        // Show toast if provided
        if (showToast) {
            showToast(isFav ? 'remove' : 'add');
        }

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
                saveToCache(next, user.id);
                return next;
            });

            return { success: false, error: err };
        }
    }, [user, favorites, supabase, saveToCache]);

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
            lastFetchedUserId.current = null; // Reset to allow new fetch
            setIsLoading(true);
            await fetchFavorites(user.id);
        }
    }, [user, fetchFavorites]);

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

export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
};
