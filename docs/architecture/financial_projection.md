# KıyasGO Altyapı Maliyet Projeksiyonu (Supabase Sonrası)

Bu rapor, Supabase gibi "Managed" servislerden çıkıp, yatırım sonrası **AWS / Cloudflare** gibi ham sağlayıcılara geçildiğindeki ("Upper Tier") maliyetleri analiz eder.

> **Varsayım:** Site artık 5-10 Milyon Ürün barındırıyor ve aylık 1 milyon+ ziyaretçi alıyor. (Gerçek bir "Scale-up" senaryosu).

---

## 1. Aylık "Üst Devre" (High Scale) Maliyet Tablosu

Supabase'i devreden çıkarıp her bir parçayı AWS üzerinde kendimiz kurarsak oluşacak fatura kalemleri:

| Kalem | Teknoloji (AWS/Cloudflare) | Tahmini Özellikler | Aylık Maliyet ($) |
| :--- | :--- | :--- | :--- |
| **Veritabanı** | **AWS RDS (PostgreSQL)** | db.m5.large (2 vCPU, 8GB RAM) + 500GB SSD | $180 - $250 |
| **Arama Motoru** | **Elasticsearch Service** | 2 Node Cluster (Hızlı arama için) | $150 - $300 |
| **Önbellek (Cache)** | **AWS ElastiCache (Redis)** | cache.t3.medium (Performans için) | $50 - $80 |
| **CDN (Resimler)** | **Cloudflare Business** | Gelişmiş görsel optimizasyonu + DDoS koruma | $200 (Sabit) |
| **Depolama (Resimler)** | **AWS S3** | 2 TB Görsel Verisi (Yedekli) | $50 - $70 |
| **Sunucu (Frontend)** | **Vercel Pro / AWS EC2** | 2x c5.large (Uygulama sunucusu) | $100 - $200 |
| **Yapay Zeka** | **GPU Sunucusu (Giriş)** | Kendi küçük modelimiz için (g4dn.xlarge - on demand) | $380 (7/24 çalışırsa) |
| **TOPLAM** | | **(Vergiler Hariç)** | **~$1.100 - $1.500 / Ay** |

**Yorum:** Supabase'de $25-$100'a çözdüğümüz iş, ham sağlayıcılarda (AWS) minimum **$1.000** bandından başlar. Çünkü yönetimi, güvenliği ve yedeklemesi artık sizin sorumluğunuzdadır ve her servis ayrı faturalandırılır.

---

## 2. Yatırım Sonrası İlk 1 Yıl Maliyeti (Burn Rate)

Yatırım aldığımızda hedef "kâr etmek" değil, "agresif büyümek" olduğu için altyapı maliyeti trafiğe paralel artacaktır.

**Senaryo:**
*   **İlk 3 Ay:** Altyapı Kurulumu ve Göç (Supabase -> AWS).
*   **3-6. Ay:** Pazarlama ile trafik 5x artar.
*   **6-12. Ay:** Yapay Zeka (AI) servislerinin aktif kullanımı.

| Dönem | Odak | Tahmini Aylık Gider (Sadece Altyapı) |
| :--- | :--- | :--- |
| **1. Çeyrek (Q1)** | Stabilizasyon & Göç | $1.500 / ay |
| **2. Çeyrek (Q2)** | Trafik Patlaması (CDN/DB ölçekleme) | $2.500 / ay |
| **3. Çeyrek (Q3)** | AI Entegrasyonu (GPU masrafları başlar) | $4.000 / ay |
| **4. Çeyrek (Q4)** | Tam Kapasite (High Availability) | $5.000 / ay |

### **1 Yıllık Toplam Altyapı Faturası:** ~$40.000 - $50.000

---

## 3. Akakçe Gibi Olmanın "Görünmeyen" Maliyeti

Sadece sunucu parası değil, bu "Upper Tier" altyapıyı ayakta tutmak için gereken insan kaynağı:

1.  **DevOps Mühendisi:** AWS RDS'i, Kubernetes'i kim yönetecek? (Maaş: $3.000+/ay)
2.  **Veri Mühendisi:** Elasticsearch indekslemeleri patlarsa kim düzeltecek?

**Yatırımcıya Sunulacak Not:**
> *"Yatırımın ilk yılında altyapı için yaklaşık **$50.000** bütçe ayırıyoruz. Bu bütçe bizi 10 Milyon kullanıcıya kadar sorunsuz taşıyacak, kendi AI modellerimizi çalıştıracak ve tescilli (proprietary) bir veri havuzu oluşturmamızı sağlayacaktır."*

## 4. Akıllı Büyüme Stratejisi (Bootstrap - Önerilen)

"Parayı yakmadan" büyümenin formülü şudur: **Supabase + Vercel**.
Devler (AWS) yerine Modern Cloud (Managed) servisleri kullanırsan, aynı işi yaparsın ama faturan %95 azalır.

| Kalem | Teknoloji | Maliyet | Neden Ucuz? |
| :--- | :--- | :--- | :--- |
| **Veritabanı** | **Supabase Pro** | **$25 / ay** | AWS RDS gibi "boşta duran" CPU'ya para ödemezsin. |
| **Hosting** | **Vercel Pro** | **$20 / ay** | Sunucu yönetmezsin, sadece trafik kadar ödersin. |
| **Resimler** | **Amazon (Link)** | **$0** | Resmi indirmeden, linki kullandığımız için. |
| **Ar-Ge** | **Gemini / Free AI** | **$0** | İlk etapta ücretsiz API limitlerini kullanırsın. |
| **TOPLAM** | | **$45 / Ay** | **(Yıllık sadece $540)** |

**Strateji:**
1.  **İlk 1 Yıl:** Sadece **$45** ödeyerek 1 Milyon üyeye kadar çıkabilirsin.
2.  **Kırılma Noktası:** Ne zaman site ayda **$5.000 kâr** etmeye başlar, o zaman AWS'ye geçeriz. O zamana kadar AWS'ye, DevOps'a para harcamak "ölü yatırımdır".
3.  **Yatırımcıya Mesaj:** *"Biz parayı sunuculara değil, reklama ve büyümeye harcayacağız. Altyapımız (Supabase) zaten milyonları kaldırıyor."*

## Sonuç
Supabase'siz "Büyük Lig"in giriş bileti aylık yaklaşık **$1.500**'dır. Büyüdükçe bu rakam $5.000+'a kadar çıkar. Bu yüzden yatırım alana kadar Supabase ($25) ile devam etmek hayati önem taşır.
