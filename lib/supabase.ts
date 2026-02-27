
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables with fallbacks for build time
// Note: URL and anon key are public, only service key needs protection
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://eupwqhesbcjczsdgkurh.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cHdxaGVzYmNqY3pzZGdrdXJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4Mzc3NzYsImV4cCI6MjA4MDQxMzc3Nn0.HvjHUvI3qS1EKfcJjNI_aLOV3_opDZLGW1MezEmXCoc";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY; // Server-only, from env vars ONLY

// Public Client (for client-side/read-only operations)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin Client (for server-side/write operations only)
// Created lazily to avoid build errors when env var is not available
let _supabaseAdmin: SupabaseClient | null = null;

export const supabaseAdmin = (() => {
    if (!_supabaseAdmin && serviceRoleKey) {
        _supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
            auth: { autoRefreshToken: false, persistSession: false }
        });
    }
    if (!_supabaseAdmin) {
        // Return a client that will fail gracefully if service key is missing
        // This allows build to succeed but runtime will use anon client
        return createClient(supabaseUrl, supabaseAnonKey, {
            auth: { autoRefreshToken: false, persistSession: false }
        });
    }
    return _supabaseAdmin;
})();
