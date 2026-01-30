# Yazım Hatası Sözlüğü (Typo Dictionary)

Bu dosya arama sırasında yazım hatalarını düzeltmek için kullanılır.
Yeni ürünler ve markalar eklendikçe bu listeyi güncelleyin.

---

## Nasıl Çalışır?

Kullanıcı "appel" yazarsa → **"Bunu mu demek istediniz? apple"** önerisi çıkar.

Kod: `app/components/SearchResults.js` → `BRAND_TYPO_MAP`

---

## Mevcut Harita

### 📱 Telefon Markaları

| Yanlış Yazım | Doğru |
|--------------|-------|
| appel, aple, aplle, apel | apple |
| samsun, samung, samusng, samsugn, samasung | samsung |
| iphon, ipone, ifone, ifonee, iphne, ipnone | iphone |
| xiomi, xaomi, xiaomii, xioami, şaomi | xiaomi |
| huavei, huwaei, hawuei, huawai | huawei |
| opoo, opo | oppo |
| realmi, relame | realme |
| honer, honr | honor |
| galaksi, galxy, galaxi | galaxy |

### 💻 Bilgisayar / Laptop Markaları

| Yanlış Yazım | Doğru |
|--------------|-------|
| lenowa, lenova | lenovo |
| azus | asus |
| soni | sony |
| reder | reeder |
| caspar, kasper | casper |
| macbok, makbook | macbook |
| msi, msI, MSI | msi |
| azer | acer |
| dal, dell | dell |
| hb, hP | hp |
| monstar, moster | monster |

### 📺 Diğer

| Yanlış Yazım | Doğru |
|--------------|-------|
| dyosn, dison | dyson |
| bosh | bosch |
| simns | siemens |
| fhilips | philips |
| roborok | roborock |

---

## Yeni Ekleme Nasıl Yapılır?

1. `app/components/SearchResults.js` dosyasını aç
2. `BRAND_TYPO_MAP` objesine yeni satır ekle:

```javascript
const BRAND_TYPO_MAP = {
    // ... mevcut satırlar
    'yeni-yanlis': 'dogru-yazim',
};
```

3. Bu dosyayı da güncelle (referans için)

---

## Eklenecekler (TODO)

- [ ] MSI laptop varyantları (msI, MSI → msi)
- [ ] Acer varyantları
- [ ] Monster laptop varyantları
- [ ] TV markaları (LG, Vestel, Philips)
- [ ] Ev aletleri markaları
