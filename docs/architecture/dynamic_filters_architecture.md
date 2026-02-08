# 🎛️ Dinamik Filtreleme Mimarisi

**Kategori Bazlı Akıllı Filtreler - Ölçeklenebilir Yaklaşım**

---

## Temel İlke

> Yeni kategori eklendiğinde, filtre tanımları da eklenmelidir.
> Sistem, tanımlı filtreleri olmayan kategoriler için fallback kullanır.

---

## 1. Filtre Tanım Yapısı

```javascript
// data.js içinde
const CATEGORY_FILTERS = {
    // Telefon kategorisi
    "cep-telefonu": {
        label: "Cep Telefonu",
        filters: [
            { 
                key: "storage", 
                label: "Dahili Hafıza", 
                icon: "HardDrive",
                type: "checkbox",
                options: ["64 GB", "128 GB", "256 GB", "512 GB", "1 TB"],
                extractFrom: "specs.storage" // Ürün verisinden çıkarım
            },
            { 
                key: "ram", 
                label: "RAM", 
                icon: "Cpu",
                type: "checkbox",
                options: ["4 GB", "6 GB", "8 GB", "12 GB", "16 GB"],
                extractFrom: "specs.ram"
            },
            {
                key: "screen_size",
                label: "Ekran Boyutu",
                icon: "Smartphone",
                type: "range",
                min: 5.0,
                max: 7.5,
                step: 0.1,
                unit: "inç"
            }
        ]
    },
    
    // Laptop kategorisi
    "laptop": {
        label: "Laptop",
        filters: [
            { key: "ram", label: "RAM", options: ["8 GB", "16 GB", "32 GB", "64 GB"] },
            { key: "screen", label: "Ekran", options: ["13\"", "14\"", "15.6\"", "17\""] },
            { key: "processor", label: "İşlemci", options: ["Intel i5", "Intel i7", "AMD Ryzen 5", "AMD Ryzen 7", "Apple M"] },
            { key: "ssd", label: "SSD", options: ["256 GB", "512 GB", "1 TB", "2 TB"] }
        ]
    },
    
    // Süpürge kategorisi (YENİ EKLENECEK)
    "supurge": {
        label: "Süpürge",
        filters: [
            { key: "type", label: "Tip", options: ["Dikey", "Toz Torbalı", "Toz Torbasız", "Islak-Kuru"] },
            { key: "power", label: "Güç", options: ["1000W altı", "1000-1500W", "1500-2000W", "2000W+"] },
            { key: "cordless", label: "Kablosuz", options: ["Evet", "Hayır"] },
            { key: "brand", label: "Marka", dynamic: true } // Dinamik: Ürünlerden çıkarılır
        ]
    },
    
    // Robot Süpürge
    "robot-supurge": {
        label: "Robot Süpürge",
        filters: [
            { key: "suction", label: "Emme Gücü", options: ["2000Pa altı", "2000-4000Pa", "4000-6000Pa", "6000Pa+"] },
            { key: "mopping", label: "Silme Özelliği", options: ["Var", "Yok"] },
            { key: "battery", label: "Pil Ömrü", options: ["2 saat altı", "2-3 saat", "3+ saat"] },
            { key: "smart", label: "Akıllı Ev", options: ["Google Home", "Alexa", "HomeKit", "Hiçbiri"] }
        ]
    }
};
```

---

## 2. Fallback Stratejisi

Tanımlı filtresi OLMAYAN kategoriler için:

```javascript
const DEFAULT_FILTERS = [
    { key: "price", label: "Fiyat Aralığı", type: "range", always: true },
    { key: "brand", label: "Marka", type: "dynamic", always: true },
    { key: "rating", label: "Puan", type: "range", min: 1, max: 5 }
];

// Kullanım
const getFiltersForCategory = (categoryId) => {
    return CATEGORY_FILTERS[categoryId]?.filters || DEFAULT_FILTERS;
};
```

---

## 3. Dinamik Filtre Değerleri

Bazı filtreler ürün verisinden otomatik çıkarılır:

```javascript
// Marka filtresi için
const getBrandOptions = (products) => {
    const brands = {};
    products.forEach(p => {
        const brand = p.name.split(' ')[0];
        brands[brand] = (brands[brand] || 0) + 1;
    });
    return Object.entries(brands)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15);
};

// Fiyat bucket'ları için
const getPriceBuckets = (products) => {
    const prices = products.map(p => p.price).filter(Boolean).sort((a, b) => a - b);
    const min = prices[0];
    const max = prices[prices.length - 1];
    // 6 bucket oluştur
    const step = (max - min) / 6;
    return Array.from({ length: 6 }, (_, i) => ({
        min: Math.round(min + (step * i)),
        max: Math.round(min + (step * (i + 1))),
        count: prices.filter(p => p >= min + (step * i) && p < min + (step * (i + 1))).length
    }));
};
```

---

## 4. Yeni Kategori Ekleme Prosedürü

Yeni kategori (örn: Klima) eklerken:

### Adım 1: data.js'e kategori tanımı ekle
```javascript
// ELECTRONICS_SUBCATEGORIES içine
{ id: "klima", label: "Klima", image: "..." }
```

### Adım 2: CATEGORY_FILTERS'a filtre tanımı ekle
```javascript
"klima": {
    label: "Klima",
    filters: [
        { key: "btu", label: "BTU", options: ["9000", "12000", "18000", "24000"] },
        { key: "type", label: "Tip", options: ["Split", "Salon", "Portatif"] },
        { key: "inverter", label: "Inverter", options: ["Evet", "Hayır"] },
        { key: "energy", label: "Enerji Sınıfı", options: ["A+++", "A++", "A+", "A"] }
    ]
}
```

### Adım 3: Ürün verisi ekle (Supabase)
- Ürünlere `specs` objesi içinde filtre değerleri eklenmeli

---

## 5. Fiyat Histogram Slider

```
┌─────────────────────────────────────┐
│  Fiyat Aralığı                      │
├─────────────────────────────────────┤
│  ▁▂▃▅▆▇█▇▅▃▂  (histogram)          │
│  [====●────────────●====]           │
│   180₺              1.781₺          │
│                                     │
│  □ 40.000 TL altı                   │
│  □ 40.000 - 80.000 TL               │
│  □ 80.000 - 120.000 TL              │
│  □ 120.000 TL ve üstü               │
└─────────────────────────────────────┘
```

---

## 6. URL Yapısı

```
/laptop?min=20000&max=50000&ram=16GB,32GB&screen=15.6&brand=Lenovo,Asus
```

Multiple değerler virgülle ayrılır.

---

## 7. Gelecek Genişlemeler

| Kategori | Planlanan Filtreler |
|----------|---------------------|
| Klima | BTU, Inverter, Enerji Sınıfı |
| Buzdolabı | Kapasite, No-Frost, Tip |
| Çamaşır Makinesi | Kapasite, Devir, Enerji |
| Kurutma Makinesi | Kapasite, Tip (Kondensli, Isı Pompalı) |
| Bulaşık Makinesi | Kapasite, Program Sayısı |
| Oyun Konsolu | Platform, Depolama |
| Kamera | Megapixel, Sensör Tipi |

---

> 🔑 **Önemli:** Her yeni kategori için `CATEGORY_FILTERS`'a tanım eklemeyi UNUTMA!
