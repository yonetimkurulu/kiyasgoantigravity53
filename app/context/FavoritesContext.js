"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext(null);

// localStorage key for favorites cache
const FAVORITES_CACHE_KEY = 'kiyasgo_favorites_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const LEGACY_ROUTE_REGEX = /en-ucuz-(.+)-fiyati/i;

const normalizeProductId = (value) => {
    if (value == null) return null;

    let text = String(value).trim();
    if (!text) return null;

    try {
        text = decodeURIComponent(text);
    } catch (e) {
        // ignore malformed URI sequences
    }

    const routeMatch = text.match(LEGACY_ROUTE_REGEX);
    if (routeMatch?.[1]) {
        text = routeMatch[1];
    }

    text = text.trim().toLowerCase();
    return text || null;
};

const getProductIdAliases = (value) => {
    const canonical = normalizeProductId(value);
    const raw = value == null ? null : String(value).trim().toLowerCase();
    return Array.from(new Set([canonical, raw].filter(Boolean)));
};

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
                return new Set((cacheData.productIds || []).map(normalizeProductId).filter(Boolean));
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

            const newFavorites = new Set((data || []).map(f => normalizeProductId(f.product_id)).filter(Boolean));
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

        if (!supabase) {
            console.error("Favorite toggle: supabase client not available");
            return { success: false, error: "No supabase client" };
        }

        // Verify we have a valid session before making the request
        try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (!session || sessionError) {
                console.warn("No active session, attempting refresh...");
                // Try to refresh the session
                const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
                if (refreshError || !refreshData?.session) {
                    console.error("Session refresh failed:", refreshError);
                    return { success: false, needsAuth: true };
                }
            }
        } catch (authErr) {
            console.error("Session check failed:", authErr);
            return { success: false, needsAuth: true };
        }

        const productIdAliases = getProductIdAliases(productId);
        const productIdStr = productIdAliases[0] || null;
        if (!productIdStr) {
            return { success: false, error: 'Invalid product id' };
        }
        const isFav = productIdAliases.some(id => favorites.has(id));

        // Optimistic update
        setFavorites(prev => {
            const next = new Set(prev);
            if (isFav) {
                for (const alias of productIdAliases) {
                    next.delete(alias);
                }
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
                    .in('product_id', productIdAliases);

                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('favorites')
                    .upsert(
                        { user_id: user.id, product_id: productIdStr },
                        { onConflict: 'user_id,product_id', ignoreDuplicates: true }
                    );

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
        const aliases = getProductIdAliases(productId);
        if (aliases.length === 0) return false;
        return aliases.some(id => favorites.has(id));
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