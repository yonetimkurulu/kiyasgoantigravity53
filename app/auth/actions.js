'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/app/utils/supabase/server'

export async function login(formData) {
    const supabase = await createClient()

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
    const supabase = await createClient()

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
    const supabase = await createClient()

    // Sign out from Supabase (this clears the session)
    await supabase.auth.signOut()

    // Revalidate and redirect to home
    revalidatePath('/', 'layout')
    redirect('/')
}
