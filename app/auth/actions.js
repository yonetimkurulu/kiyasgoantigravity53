'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/app/utils/supabase/server'

export async function login(formData) {
    const supabase = createClient()

    // FormData'dan verileri al (veya obje olarak geliyorsa direkt kullan)
    // AuthForm'dan obje olarak göndereceğiz, o yüzden parametreyi düzelteceğiz.
    const email = formData.email
    const password = formData.password

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signup(formData) {
    const supabase = createClient()

    const email = formData.email
    const password = formData.password
    const nickname = formData.nickname

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                nickname: nickname,
                full_name: nickname, // Keep for backwards compatibility
            },
        },
    })

    if (error) {
        return { error: error.message }
    }

    // Insert profile with nickname
    if (data.user) {
        await supabase.from('profiles').insert({
            id: data.user.id,
            email: email,
            nickname: nickname,
            full_name: nickname, // Default full_name to nickname
            updated_at: new Date()
        });
    }

    return { success: true }
}

export async function signout() {
    const supabase = createClient()

    // 1. Sign out from Supabase
    await supabase.auth.signOut()

    // 2. Clear all auth cookies from server
    const { cookies } = await import('next/headers')
    const cookieStore = cookies()

    // Get all cookies and delete Supabase-related ones
    const allCookies = cookieStore.getAll()
    for (const cookie of allCookies) {
        if (cookie.name.includes('sb-') || cookie.name.includes('supabase')) {
            cookieStore.delete(cookie.name)
        }
    }

    // 3. Revalidate and redirect
    revalidatePath('/', 'layout')
    redirect('/')
}
