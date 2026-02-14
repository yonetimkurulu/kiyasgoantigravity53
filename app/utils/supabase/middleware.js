
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export const updateSession = async (request) => {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "https://eupwqhesbcjczsdgkurh.supabase.co",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cHdxaGVzYmNqY3pzZGdrdXJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4Mzc3NzYsImV4cCI6MjA4MDQxMzc3Nn0.HvjHUvI3qS1EKfcJjNI_aLOV3_opDZLGW1MezEmXCoc",
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, {
                            ...options,
                            // Mobile browser compatibility
                            sameSite: 'lax',
                            secure: process.env.NODE_ENV === 'production',
                            path: '/',
                        })
                    )
                },
            },
        }
    )

    // IMPORTANT: DO NOT REMOVE auth.getUser()
    try {
        await supabase.auth.getUser()
    } catch (err) {
        // If Supabase is unreachable or error, we just continue.
        // The session might be invalid, but we don't want to block the request.
        console.error("Middleware Auth Error:", err)
    }

    return response
}
