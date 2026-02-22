
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { getSupabaseConfig } from './config'

export const updateSession = async (request) => {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })
    const { url, anonKey } = getSupabaseConfig()

    const supabase = createServerClient(
        url,
        anonKey,
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
