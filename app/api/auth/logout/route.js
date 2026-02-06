import { createClient } from '@/app/utils/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
    try {
        // 1. Sign out from Supabase
        const supabase = createClient()
        await supabase.auth.signOut()

        // 2. Get cookie store and delete all Supabase cookies
        const cookieStore = cookies()
        const allCookies = cookieStore.getAll()

        for (const cookie of allCookies) {
            if (cookie.name.includes('sb-') || cookie.name.includes('supabase')) {
                cookieStore.delete(cookie.name)
            }
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Logout error:', error)
        return NextResponse.json({ error: 'Logout failed' }, { status: 500 })
    }
}
