
import { createClient } from '@supabase/supabase-js';

// Supabase istemcisini oluştur
// Backend işlemleri için Service Role Key kullanılması önerilir (yazma izinleri için)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('--- Supabase Config Debug ---');
console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Mevcut (OK)' : 'EKSİK (MISSING)');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Mevcut (Backend)' : 'Yok (Frontend için normal)');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Mevcut (OK)' : 'EKSİK (MISSING)');
console.log('-----------------------------');

let supabaseClient;

if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase URL veya Key eksik! Lütfen .env dosyasını kontrol edin.');
    // Dummy client to prevent crash
    supabaseClient = {
        from: () => ({
            select: () => ({
                ilike: () => ({
                    limit: () => ({
                        single: async () => ({ data: null, error: { message: 'Supabase credentials missing' } })
                    })
                })
            }),
            upsert: async () => ({ error: { message: 'Supabase credentials missing' } })
        })
    };
} else {
    try {
        supabaseClient = createClient(supabaseUrl, supabaseKey);
    } catch (error) {
        console.error('Supabase init error:', error);
        supabaseClient = { from: () => ({ select: () => ({ ilike: () => ({ limit: () => ({ single: async () => ({ data: null }) }) }) }) }) };
    }
}

export const supabase = supabaseClient;

/**
 * Scrape edilen veriyi Supabase'e kaydeder.
 * @param {Object} data - Telefon verisi
 */
export async function saveToSupabase(data) {
    if (!supabase || !supabase.from) return false;

    const { error } = await supabase
        .from('phones')
        .upsert(data, { onConflict: 'url' }); // URL unique olmalı

    if (error) {
        console.error('Supabase kayıt hatası:', error.message);
        throw new Error('Veritabanına kaydedilemedi: ' + error.message);
    }

    return true;
}
