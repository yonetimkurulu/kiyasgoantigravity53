# ABSA-Lite Decision Engine Architecture

KıyasGO asistanı için yeni karar katmanı: **Aspect-Based (ABSA-Lite) + Signal Scoring**.
Bu doküman, mevcut mimariyi bozmadan karar mekanizmasını modüler hale getirmek için uygulanabilir altyapıyı tanımlar.

---

## 1) Amaç

Mevcut durum:
- Intent, feature ve ranking kuralları ağırlıklı olarak `app/api/openai/route.js` içinde.
- Kurallar büyüdükçe bakım maliyeti ve regresyon riski artıyor.

Hedef:
- Karar mantığını modüllere ayırmak.
- "Kullanıcının ilk söylediği kriter"i deterministik olarak birincil öncelik yapmak.
- Skorlamayı explainable (izlenebilir) hale getirmek.

---

## 2) Konumlandırma (Master Architecture ile uyum)

Bu katman, `master_architecture.md` içindeki **Intelligence Core / Processing Engines** bölümünde yer alan PIE-CSE yaklaşımına "chat decision orchestrator" olarak oturur.

- PIE/CSE veri/sinyal üretir.
- ABSA-Lite Decision Engine, kullanıcı niyeti + sinyalleri birleştirip öneri sıralar.

---

## 3) Bileşenler

### A. Aspect Parser (ABSA-Lite)
Dosya: `app/utils/ai/absaDecisionEngine.js`

Sorumluluklar:
- Prompt normalize etme
- Aspect tespiti (kamera, depolama, ısınma, performans...)
- Aspect öncelik sırası (metindeki ilk geçişe göre)
- Öncelik katsayısı üretimi

### B. Decision Trace Builder
Dosya: `app/utils/ai/absaDecisionEngine.js`

Sorumluluklar:
- Effective budget/category/aspect zincirini tek objede toplama
- API yanıtında `decision` alanı ile gözlemlenebilirlik

### C. Recommendation Scorer
Dosya: `app/api/openai/route.js` (şu an)

Sorumluluklar:
- Feature sinyallerini ağırlıklı skora çevirme
- Isınma/depolama gibi kriterleri hard-filter yerine weighted ranking ile uygulama
- Sinyalleri suggestion objesine ekleme

---

## 4) Veri Sözleşmesi

### 4.1 Decision Trace
```json
{
  "version": "absa-lite-v1",
  "prompt": "40 bin tl alti isinmayan laptop oner",
  "effectiveCategory": "laptop",
  "effectiveBudget": 40000,
  "primaryAspect": "thermal",
  "orderedAspects": [
    {"id": "thermal", "confidence": 0.8},
    {"id": "performance", "confidence": 0.6}
  ],
  "brandPrefs": [],
  "createdAt": "2026-03-01T12:00:00.000Z"
}
```

### 4.2 Suggestion Signals
```json
{
  "name": "...",
  "score": 61,
  "priorityFeatures": ["thermal", "performance"],
  "signals": {
    "storageGb": 512,
    "batteryMah": 5000,
    "screenHz": 144,
    "gpuModel": "RTX 4060",
    "thermalLevel": "mid",
    "thermalScore": 6
  }
}
```

---

## 5) Karar Akışı

1. Prompt normalize edilir.
2. Aspectler çıkarılır ve sıralanır.
3. Category + budget + history bağlamı resolve edilir.
4. Aday ürünler skorlanır:
   - Budget yakınlığı
  - Brand uyumu
   - Aspect sinyal skoru * priority multiplier
5. Öneriler explainable sinyallerle döner.
6. `decision` trace API cevabına eklenir.

---

## 6) Fazlı Uygulama Planı

### Phase 0 (Tamamlandı)
- ABSA-Lite modülü eklendi.
- Feature ordering + multiplier modüler hale geldi.
- API response `decision` trace üretmeye başladı.

### Phase 1
- `route.js` içindeki scorer fonksiyonlarını `app/utils/ai/decision/scorers/*` altına taşı.
- Her feature için ayrı scorer kontratı:
  - input: `{row, product, context}`
  - output: `{score, evidence}`

### Phase 2
- Decision Policy katmanı:
  - `strict`, `balanced`, `exploratory` politika profilleri
  - kategoriye göre policy override

### Phase 3
- PIE/CSE ile birleşim:
  - `product_intel` ve `commerce_signals` tablosundan doğrudan sinyal tüketimi
  - confidence/freshness ile score discounting

---

## 7) Operasyonel Kurallar

- Hard filter yalnızca güvenlik/doğruluk gerekliyse (örn: bütçe > %50 aşım) kullanılmalı.
- Kullanıcı önceliği her zaman explainable olmalı (`priorityFeatures`, `decision.primaryAspect`).
- Prompt içi Turkish particles (`mi/mu`) marka alias'ı ile karışmamalı.

---

## 8) Açık İşler

- `decision` trace telemetry tablosu açıldı: `agent_decision_logs`
  - Migration: `supabase/add_agent_decision_logs.sql`
- UI tarafında debug toggle ile decision trace gösterimi (yalnız admin).
- ABSA-Lite confidence kalibrasyonu için offline eval scripti.

---

## 9) İlgili Dosyalar

- `docs/architecture/master_architecture.md`
- `docs/architecture/product_intelligence_engine.md`
- `docs/architecture/AI_DEVELOPER_HANDOFF.md`
- `app/utils/ai/absaDecisionEngine.js`
- `app/api/openai/route.js`
