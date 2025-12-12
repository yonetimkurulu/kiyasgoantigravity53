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
    const fullName = formData.fullName

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
            },
            // Redirect is handled by client or middleware for email verification
            // But for now let's keep it simple.
        },
    })

    if (error) {
        return { error: error.message }
    }

    // Insert profile manually if needed (Supabase triggers are better but this is safe fallback)
    if (data.user) {
        await supabase.from('profiles').insert({
            id: data.user.id,
            email: email,
            full_name: fullName,
            updated_at: new Date()
        });
    }

    return { success: true }
}

export async function signout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/giris-yap')
}
