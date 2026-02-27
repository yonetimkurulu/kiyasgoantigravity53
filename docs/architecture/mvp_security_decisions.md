# 🔐 MVP Security Decisions

Son güncelleme: 27 Şubat 2026

## HMAC şimdi gerekli mi?

**Karar:** Şu anki MVP aşamasında **zorunlu değil**, ama growth aşamasında eklenecek.

### Neden şu an zorunlu değil?
- API'lerde aynı-origin kontrolü aktif.
- İçerik tipi, payload sanitize ve karakter/uzunluk limitleri aktif.
- Middleware tarafında rate limiting + bot UA engelleme aktif.
- SQL wildcard abuse ve giriş sanitizasyonu eklendi.

### Hangi durumda HMAC'e geçilecek?
Bu koşullardan biri olursa HMAC devreye alınmalı:
1. Public/mobile client'lara açık dış API yayını
2. Partner/B2B API key dağıtımı
3. LLM maliyetini artıran bot trafiği (persisten abuse)
4. Origin bypass veya replay atak gözlemi

### Hedeflenen HMAC kapsamı (Faz 2+)
- `X-KG-Timestamp` + `X-KG-Signature` (HMAC-SHA256)
- 60sn clock-skew toleransı
- Nonce/replay cache (Redis)
- Secret rotasyonu (aktif + bir önceki key)

## MVP'de aktif olan güvenlik seti (şu an)
- Origin doğrulama (`/api/openai`, `/api/ai-compare`)
- `Content-Type: application/json` zorunluluğu
- Prompt/messages sanitizasyonu
- Prompt/message length limitleri
- LLM timeout + provider fallback
- Bot UA blocklist + emergency local rate limiter
- SQL-safe query sanitizasyonu (`variants`, `ai-compare`)
