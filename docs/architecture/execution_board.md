# 🗂️ KıyasGO Execution Board (Now / Next / Later)

Son güncelleme: 27 Şubat 2026

> Bu dosya, `docs/architecture` içindeki planların operasyonel özetidir.
> Detay tasarım için kaynak dokümanlar: `master_architecture.md`, `infrastructure_evolution_plan.md`, `scaling_plan.md`, `ai_agent_gap_analysis.md`.

---

## ✅ Now (MVP - Aktif)

### Güvenlik & Dayanıklılık
- [x] OpenAI-first provider + multi-provider abstraction (`app/utils/ai/provider.js`)
- [x] Origin + content-type doğrulama (`/api/openai`, `/api/ai-compare`)
- [x] Input sanitization + prompt/message limitleri
- [x] Middleware rate-limit + local emergency limiter
- [x] Bot UA blocklist (AI endpointleri)
- [x] SQL wildcard abuse koruması (`variants`, `ai-compare`)

### AI Asistan (MVP kalite)
- [x] Bütçe + kategori bazlı öneri motoru
- [x] Marka + özellik + bütçe skorlaması
- [x] Çok kategori desteği (telefon/laptop/tablet/TV/kulaklık vb.)
- [x] Güvenli fallback (kategori sparse ise token fallback)
- [x] Assistant smoke test (`npm run smoke:assistant`)

### Performans
- [x] Ürün öneri verisi için kısa TTL cache (route-level)
- [x] LLM timeout (`AI_REQUEST_TIMEOUT_MS`)
- [x] Typo smoke test (`npm run smoke:typo`)

---

## 🔜 Next (2-4 Hafta)

### AI Platformlaştırma
- [ ] `/api/ai-gateway` tek giriş endpointi
- [ ] Intent router + agent base class
- [ ] `agent_logs` tablosu + observability (latency, success, cost)

### LLM Stratejisi
- [ ] Groq provider testi (MVP fallback OpenAI kalacak)
- [ ] Provider health metrics (timeout/error ratio)

### Search & Data
- [ ] Typesense POC (50K+ ürün eşiği için)
- [ ] Trending/precompute cache planı

---

## 🕒 Later (1-3 Ay)

### Scale & Infra
- [ ] DB migration kararı (Railway/Neon/Hetzner)
- [ ] Price history ayrı depolama (Timescale yaklaşımı)
- [ ] Search engine migration (Typesense/Meili)

### AI Independence
- [ ] Self-hosted LLM pilot (Ollama/Llama)
- [ ] Hybrid routing (critical → local, fallback → OpenAI)

### Güvenlik (Growth Trigger)
- [ ] HMAC request signing (public API/partner açılınca)
- [ ] Nonce + replay protection (Redis)
- [ ] API key tiers + abuse analytics

---

## ⛳ Karar Notu (MVP)
- HMAC şu an **opsiyonel**; aktif korumalar MVP için yeterli.
- Trigger oluşursa (partner API, public mobile clients, replay/bot abuse artışı) HMAC Faz 2'ye alınacak.
- Detay: `mvp_security_decisions.md`.
