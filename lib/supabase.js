
import { createClient } from '@supabase/supabase-js';

// Supabase istemcisini oluştur
// Backend işlemleri için Service Role Key kullanılması önerilir (yazma izinleri için)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase URL veya Key eksik! Lütfen .env dosyasını kontrol edin.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Scrape edilen veriyi Supabase'e kaydeder.
 * @param {Object} data - Telefon verisi
 */
export async function saveToSupabase(data) {
    const { error } = await supabase
        .from('phones')
        .upsert(data, { onConflict: 'url' }); // URL unique olmalı

    if (error) {
        console.error('Supabase kayıt hatası:', error.message);
        throw new Error('Veritabanına kaydedilemedi: ' + error.message);
    }

    return true;
}
