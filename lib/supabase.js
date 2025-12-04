
import { createClient } from '@supabase/supabase-js';

// Supabase istemcisini oluştur
// DİKKAT: Anahtarları buraya manuel yazdık (Hardcoded).
// Normalde .env dosyasından gelmesi daha güvenlidir ama Vercel sorunu için geçici çözüm.

const supabaseUrl = "https://eupwqhesbcjczsdgkurh.supabase.co";

// ANON KEY (Public - Frontend için güvenli olan):
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cHdxaGVzYmNqY3pzZGdrdXJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4Mzc3NzYsImV4cCI6MjA4MDQxMzc3Nn0.HvjHUvI3qS1EKfcJjNI_aLOV3_opDZLGW1MezEmXCoc";

// SERVICE ROLE KEY (Secret - Sadece Backend Scraper için gerekli, buraya koymak risklidir ama yedek olarak dursun):
// const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cHdxaGVzYmNqY3pzZGdrdXJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDgzNzc3NiwiZXhwIjoyMDgwNDEzNzc2fQ.iuyn8M3WvaFhHjXKkqLNRMsjoVARuvy22TIaAM1YJ80";

console.log('--- Supabase Config Debug (Hardcoded) ---');
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseKey ? 'Mevcut (Anon)' : 'EKSİK');
console.log('-----------------------------------------');

let supabaseClient;

if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase URL veya Key eksik!');
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
