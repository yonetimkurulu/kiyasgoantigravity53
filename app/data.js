
import React from 'react';

export const generatePrices = (basePrice) => [
    { store: "Trendyol", price: basePrice, color: "text-orange-600 dark:text-orange-400" },
    { store: "Hepsiburada", price: basePrice - 500, color: "text-orange-500 dark:text-orange-300" },
    { store: "Amazon", price: basePrice + 250, color: "text-yellow-600 dark:text-yellow-400" },
    { store: "N11", price: basePrice + 100, color: "text-purple-600 dark:text-purple-400" },
    { store: "MediaMarkt", price: basePrice + 1000, color: "text-red-600 dark:text-red-400" },
];

export const ELECTRONICS_SUBCATEGORIES = [
    {
        id: "beyaz-esya",
        label: "Beyaz Eşya",
        icon: "❄️",
        image: "https://cdn.dsmcdn.com/mnresize/500/-/ty1062/product/media/images/prod/SPM/PIM/20231127/15/48b269be-b1ce-3298-b80c-7b06820c78a1/1_org_zoom.jpg",
        description: "Kurutma Makinesi, Buzdolabı, Klima, Çamaşır Makinesi",
        subIds: ["ankastre-set", "aspirator", "banket-arabasi", "beyaz-esya-seti", "beyaz-esya-yedek-parca", "bulasik-makinesi", "buzdolabi", "camasir-makinesi", "davlumbaz", "derin-dondurucu", "endustriyel-dondurucu", "endustriyel-yikama", "firin", "klima", "kurutma-makinesi", "mikrodalga-firin", "ocak", "su-sebili", "sise-sogutucu", "teshir-dolabi"],
        children: [
            { id: "ankastre-set", label: "Ankastre Set", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "aspirator", label: "Aspiratör", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "banket-arabasi", label: "Banket Arabası", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "beyaz-esya-seti", label: "Beyaz Eşya Seti", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "beyaz-esya-yedek-parca", label: "Beyaz Eşya Yedek Parça", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "bulasik-makinesi", label: "Bulaşık Makinesi", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "buzdolabi", label: "Buzdolabı", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "camasir-makinesi", label: "Çamaşır Makinesi", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "davlumbaz", label: "Davlumbaz", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "derin-dondurucu", label: "Derin Dondurucu", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "endustriyel-dondurucu", label: "Endüstriyel Dondurucu", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "endustriyel-yikama", label: "Endüstriyel Yıkama", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "firin", label: "Fırın", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "klima", label: "Klima", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "kurutma-makinesi", label: "Kurutma Makinesi", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "mikrodalga-firin", label: "Mikrodalga Fırın", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "ocak", label: "Ocak", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "su-sebili", label: "Su Sebili", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "sise-sogutucu", label: "Şişe Soğutucu", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "teshir-dolabi", label: "Teşhir Dolabı", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" }
        ]
    },
    {
        id: "bilgisayar-bilesenler",
        label: "Bilgisayar & Bileşenler",
        icon: "💻",
        image: "https://cdn.dsmcdn.com/mnresize/500/-/ty985/product/media/images/prod/SPM/PIM/20230911/14/b6338381-127e-3fd9-9762-8f92931215b8/1_org_zoom.jpg",
        description: "Monitör, Bilgisayar Bileşenleri, Bilgisayarlar, Yazıcılar",
        subIds: ["bilgisayar-aksesuarlari", "bilgisayar-bilesenleri", "bilgisayarlar", "cevre-birimleri", "fotokopi-makinesi", "laptop-yedek-parca", "monitor", "network-urunleri", "oyuncu-koltugu", "sunucu-donanimlari", "tablet-yedek-parca", "veri-depolama", "yazicilar", "yazilim"],
        children: [
            { id: "bilgisayar-aksesuarlari", label: "Bilgisayar Aksesuarları", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "bilgisayar-bilesenleri", label: "Bilgisayar Bileşenleri", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "bilgisayarlar", label: "Bilgisayarlar", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "cevre-birimleri", label: "Çevre Birimleri", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "fotokopi-makinesi", label: "Fotokopi Makinesi", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "laptop-yedek-parca", label: "Laptop Yedek Parça", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "monitor", label: "Monitör", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "network-urunleri", label: "Network Ürünleri", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "oyuncu-koltugu", label: "Oyuncu Koltuğu", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "sunucu-donanimlari", label: "Sunucu ve Donanımları", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "tablet-yedek-parca", label: "Tablet Yedek Parça", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "veri-depolama", label: "Veri Depolama", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "yazicilar", label: "Yazıcılar", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "yazilim", label: "Yazılım", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" }
        ]
    },
    {
        id: "kamera-goruntu",
        label: "Kamera & Görüntü Sistemleri",
        icon: "📷",
        image: "https://cdn.dsmcdn.com/mnresize/500/-/ty393/product/media/images/20220409/16/86903823/56910795/1/1_org_zoom.jpg",
        description: "Fotoğraf Makinesi, Drone, Aksiyon Kamerası ve Aksesuarlar",
        subIds: ["aksiyon-kamera-aksesuari", "aksiyon-kamerasi", "dijital-fotograf-cercevesi", "drone", "drone-aksesuari", "film-tarayici", "flas", "flas-aksesuari", "fotograf-makinesi", "fotograf-makinesi-aksesuar", "fotokapan", "hafiza-karti", "objektif", "objektif-aksesuari", "sabitleyiciler", "studyo-isik", "video-kamera", "video-kamera-aksesuari", "yilan-kamera"],
        children: [
            { id: "aksiyon-kamera-aksesuari", label: "Aksiyon Kamera Aksesuarı", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "aksiyon-kamerasi", label: "Aksiyon Kamerası", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "dijital-fotograf-cercevesi", label: "Dijital Fotoğraf Çerçevesi", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "drone", label: "Drone", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "drone-aksesuari", label: "Drone Aksesuarı", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "film-tarayici", label: "Film Tarayıcı", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "flas", label: "Flaş", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "flas-aksesuari", label: "Flaş Aksesuarı", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "fotograf-makinesi", label: "Fotoğraf Makinesi", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "fotograf-makinesi-aksesuar", label: "Fotoğraf Makinesi Aksesuar", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "fotokapan", label: "Fotokapan", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "hafiza-karti", label: "Hafıza Kartı", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "objektif", label: "Objektif", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "objektif-aksesuari", label: "Objektif Aksesuarı", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "sabitleyiciler", label: "Sabitleyiciler", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "studyo-isik", label: "Stüdyo, Işıklandırma Ekipmanları", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "video-kamera", label: "Video Kamera", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "video-kamera-aksesuari", label: "Video Kamera Aksesuarı", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "yilan-kamera", label: "Yılan Kamera", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" }
        ]
    },
    {
        id: "isitma-sogutma",
        label: "Isıtma & Soğutma",
        icon: "🌡️",
        image: "https://cdn.dsmcdn.com/mnresize/500/-/ty951/product/media/images/prod/SPM/PIM/20230623/10/7c010886-c30c-39ff-939e-4e68e4118f6c/1_org_zoom.jpg",
        description: "Klima, Isıtıcı, Kombi, Soba ve Daha Fazlası",
        subIds: ["ani-su-isitici", "boyler", "fan-coil", "hava-perdesi", "hava-sogutucu", "havlupan", "isi-pompasi", "isitici", "isitici-yedek-parca", "kalorifer-kazani", "kazan-yedek-parca", "klima", "klima-yedek-parca", "kombi", "kombi-yedek-parca", "soba", "soba-somine-aksesuarlari", "sofben", "somine", "termosifon", "termostat", "vantilator", "vantilator-yedek-parca"],
        children: [
            { id: "ani-su-isitici", label: "Ani Su Isıtıcı", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "boyler", label: "Boyler", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "fan-coil", label: "Fan Coil", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "hava-perdesi", label: "Hava Perdesi", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "hava-sogutucu", label: "Hava Soğutucu", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "havlupan", label: "Havlupan", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "isi-pompasi", label: "Isı Pompası", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "isitici", label: "Isıtıcı", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "isitici-yedek-parca", label: "Isıtıcı Yedek Parça ve Aksesuar", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "kalorifer-kazani", label: "Kalorifer Kazanı", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "kazan-yedek-parca", label: "Kazan Yedek Parça", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "klima", label: "Klima", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "klima-yedek-parca", label: "Klima Yedek Parça", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "kombi", label: "Kombi", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "kombi-yedek-parca", label: "Kombi Yedek Parça", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "soba", label: "Soba", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "soba-somine-aksesuarlari", label: "Soba & Şömine Aksesuarları", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "sofben", label: "Şofben", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "somine", label: "Şömine", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "termosifon", label: "Termosifon", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "termostat", label: "Termostat", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "vantilator", label: "Vantilatör", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "vantilator-yedek-parca", label: "Vantilatör Yedek Parça", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" }
        ]
    },
    {
        id: "kucuk-ev-aletleri",
        label: "Küçük Ev Aletleri",
        icon: "🧹",
        image: "https://cdn.dsmcdn.com/mnresize/500/-/ty1060/product/media/images/prod/SPM/PIM/20231124/15/4fc80362-e935-3765-b924-d23259451121/1_org_zoom.jpg",
        description: "Süpürme, İçecek Hazırlama, Hava Temizleyici, Ütü ve Daha Fazlası",
        subIds: ["buz-makinesi", "cam-silme-makinesi", "dikis-makinesi", "dikis-makinesi-yedek-parca", "elektrikli-pisirme", "elektronik-ceyiz-seti", "endustriyel-icecek-hazirlama", "endustriyel-pisirici", "endustriyel-yiyecek-hazirlama", "hava-temizleyici", "icecek-hazirlama", "nem-alma-cihazi", "pratik-ev-aleti", "su-aritma-cihazi", "supurme-yikama", "tuy-toplama-makinesi", "utu", "yedek-parca-aksesuar", "yiyecek-hazirlama"],
        children: [
            { id: "buz-makinesi", label: "Buz Makinesi", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "cam-silme-makinesi", label: "Cam Silme Makinesi", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "dikis-makinesi", label: "Dikiş Makinesi", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "dikis-makinesi-yedek-parca", label: "Dikiş Makinesi Yedek Parça", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "elektrikli-pisirme", label: "Elektrikli Pişirme", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "elektronik-ceyiz-seti", label: "Elektronik Çeyiz Seti", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "endustriyel-icecek-hazirlama", label: "Endüstriyel İçecek Hazırlama", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "endustriyel-pisirici", label: "Endüstriyel Pişirici", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "endustriyel-yiyecek-hazirlama", label: "Endüstriyel Yiyecek Hazırlama", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "hava-temizleyici", label: "Hava Temizleyici", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "icecek-hazirlama", label: "İçecek Hazırlama", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "nem-alma-cihazi", label: "Nem Alma Cihazı", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "pratik-ev-aleti", label: "Pratik Ev Aleti", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "su-aritma-cihazi", label: "Su Arıtma Cihazı ve Yedek Parça", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "supurme-yikama", label: "Süpürme, Yıkama", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "tuy-toplama-makinesi", label: "Tüy Toplama Makinesi", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "utu", label: "Ütü", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "yedek-parca-aksesuar", label: "Yedek Parça ve Aksesuar", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "yiyecek-hazirlama", label: "Yiyecek Hazırlama", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" }
        ]
    },
    {
        id: "konsol-oyun",
        label: "Konsol ve Oyun Ürünleri",
        icon: "🎮",
        image: "https://cdn.dsmcdn.com/mnresize/500/-/ty1084/product/media/images/prod/SPM/PIM/20231212/06/def2442d-222c-3507-b236-fa2642642571/1_org_zoom.jpg",
        description: "PS5 Ürünleri, Xbox Series Ürünleri",
        subIds: ["oyun-konsolu", "oyun-kolu", "oyunlar"]
    },
    {
        id: "telefon-aksesuar",
        label: "Telefon Ürünleri ve Aksesuarları",
        icon: "📱",
        image: "https://cdn.dsmcdn.com/mnresize/500/-/ty1053/product/media/images/prod/SPM/PIM/20231120/09/5c98d492-498c-392c-9878-854737759654/1_org_zoom.jpg",
        description: "Cep Telefonu, Bluetooth Kulaklık, Giyilebilir Teknoloji, Şarj Aletleri",
        subIds: ["cep-telefonu", "bluetooth-kulaklik", "akilli-saat", "bluetooth-arac-kiti", "bluetooth-hoparlor", "bluetooth-kulaklik-kilifi", "cagri-merkezi-kulakligi", "giyilebilir-teknoloji", "gps-takip", "konferans-telefonu", "kulaklik-kutusu", "masaustu-telefon", "sarj-urunleri", "telefon-aksesuarlari", "telefon-santrali", "telsiz", "telsiz-telefon", "video-konferans", "yedek-parca"],
        children: [
            { id: "bluetooth-arac-kiti", label: "Bluetooth Araç Kiti", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "bluetooth-hoparlor", label: "Bluetooth Hoparlör", image: "https://cdn.akakce.com/iv/1015/551/3/551326_1.jpg" },
            { id: "bluetooth-kulaklik", label: "Bluetooth Kulaklık", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "bluetooth-kulaklik-kilifi", label: "Bluetooth Kulaklık Kılıfı", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "cep-telefonu", label: "Cep Telefonu", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "cagri-merkezi-kulakligi", label: "Çağrı Merkezi Kulaklığı", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "giyilebilir-teknoloji", label: "Giyilebilir Teknoloji", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "gps-takip", label: "GPS Takip Cihazı", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "konferans-telefonu", label: "Konferans Telefonu", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "kulaklik-kutusu", label: "Kulaklık Kutusu", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "masaustu-telefon", label: "Masaüstü Telefon", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "sarj-urunleri", label: "Şarj Ürünleri", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "telefon-aksesuarlari", label: "Telefon Aksesuarları", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "telefon-santrali", label: "Telefon Santrali", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "telsiz", label: "Telsiz", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "telsiz-telefon", label: "Telsiz Telefon", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "video-konferans", label: "Video Konferans Sistemi", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" },
            { id: "yedek-parca", label: "Yedek Parça", image: "https://cdn.akakce.com/iv/1000/876/3/876378_1.jpg" }
        ]
    },
    {
        id: "tv-ses-goruntu",
        label: "TV, Ses, Görüntü Sistemleri",
        icon: "📺",
        image: "https://cdn.dsmcdn.com/mnresize/500/-/ty1005/product/media/images/prod/SPM/PIM/20230929/11/482701b2-11c7-3195-a4e9-158866236b28/1_org_zoom.jpg",
        description: "Televizyon, Ses Sistemleri, Güvenlik Sistemleri",
        subIds: ["televizyon", "ses-sistemi", "ev-sinema"]
    }
];

export const PRODUCTS_DATA = [
    // --- CEP TELEFONLARI ---
    {
        "id": "iphone-15-pro",
        "name": "Apple iPhone 15 Pro",
        "price": 89999,
        "image": "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-pro.jpg",
        "desc": "Titanyum tasarım ve A17 Pro çip.",
        "rating": 4.8,
        "category": "elektronik",
        "subcategory": "cep-telefonu",
        "prices": generatePrices(89999)
    },
    {
        "id": "samsung-galaxy-s24-ultra",
        "name": "Samsung Galaxy S24 Ultra",
        "price": 84999,
        "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-ultra-5g-sm-s928.jpg",
        "desc": "Galaxy AI ile akıllı telefon deneyimi.",
        "rating": 4.7,
        "category": "elektronik",
        "subcategory": "cep-telefonu",
        "prices": generatePrices(84999)
    },
    {
        "id": "iphone-15",
        "name": "Apple iPhone 15",
        "price": 59999,
        "image": "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15.jpg",
        "desc": "Dinamik Ada ve 48 MP ana kamera.",
        "rating": 4.6,
        "category": "elektronik",
        "subcategory": "cep-telefonu",
        "prices": generatePrices(59999)
    },
    {
        "id": "samsung-galaxy-s24-plus",
        "name": "Samsung Galaxy S24+",
        "price": 64999,
        "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-plus-5g-sm-s926.jpg",
        "desc": "Güçlü performans ve uzun pil ömrü.",
        "rating": 4.5,
        "category": "elektronik",
        "subcategory": "cep-telefonu",
        "prices": generatePrices(64999)
    },
    {
        "id": "xiaomi-14-pro",
        "name": "Xiaomi 14 Pro",
        "price": 54999,
        "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-14-pro.jpg",
        "desc": "Leica kamera ve Snapdragon 8 Gen 3.",
        "rating": 4.6,
        "category": "elektronik",
        "subcategory": "cep-telefonu",
        "prices": generatePrices(54999)
    },
    {
        "id": "samsung-galaxy-a55",
        "name": "Samsung Galaxy A55 5G",
        "price": 22999,
        "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a55.jpg",
        "desc": "Dayanıklı tasarım ve harika kamera.",
        "rating": 4.4,
        "category": "elektronik",
        "subcategory": "cep-telefonu",
        "prices": generatePrices(22999)
    },
    {
        "id": "iphone-14",
        "name": "Apple iPhone 14",
        "price": 47999,
        "image": "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-14.jpg",
        "desc": "Çarpışma algılama ve harika pil.",
        "rating": 4.5,
        "category": "elektronik",
        "subcategory": "cep-telefonu",
        "prices": generatePrices(47999)
    },
    {
        "id": "samsung-galaxy-z-fold5",
        "name": "Samsung Galaxy Z Fold5",
        "price": 99999,
        "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-fold5.jpg",
        "desc": "Katlanabilir ekran ve çok yönlülük.",
        "rating": 4.7,
        "category": "elektronik",
        "subcategory": "cep-telefonu",
        "prices": generatePrices(99999)
    },
    {
        "id": "xiaomi-redmi-note-13-pro",
        "name": "Xiaomi Redmi Note 13 Pro+ 5G",
        "price": 24999,
        "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-13-pro.jpg",
        "desc": "200 MP kamera ve hızlı şarj.",
        "rating": 4.5,
        "category": "elektronik",
        "subcategory": "cep-telefonu",
        "prices": generatePrices(24999)
    },
    {
        "id": "oppo-reno-11-pro",
        "name": "OPPO Reno11 Pro 5G",
        "price": 32999,
        "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-reno11-pro-5g.jpg",
        "desc": "Portre uzmanı ve şık tasarım.",
        "rating": 4.4,
        "category": "elektronik",
        "subcategory": "cep-telefonu",
        "prices": generatePrices(32999)
    },
    {
        "id": "samsung-galaxy-s23-fe",
        "name": "Samsung Galaxy S23 FE",
        "price": 29999,
        "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s23-fe.jpg",
        "desc": "Fan Edition, harika değer.",
        "rating": 4.3,
        "category": "elektronik",
        "subcategory": "cep-telefonu",
        "prices": generatePrices(29999)
    },
    {
        "id": "iphone-13",
        "name": "Apple iPhone 13",
        "price": 39999,
        "image": "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-13.jpg",
        "desc": "Uzun pil ömrü ve güçlü çip.",
        "rating": 4.6,
        "category": "elektronik",
        "subcategory": "cep-telefonu",
        "prices": generatePrices(39999)
    },
    {
        "id": "xiaomi-poco-x6-pro",
        "name": "Xiaomi Poco X6 Pro 5G",
        "price": 18999,
        "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-x6-pro.jpg",
        "desc": "Oyun performansı şampiyonu.",
        "rating": 4.4,
        "category": "elektronik",
        "subcategory": "cep-telefonu",
        "prices": generatePrices(18999)
    },
    {
        "id": "samsung-galaxy-a35",
        "name": "Samsung Galaxy A35 5G",
        "price": 16999,
        "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a35.jpg",
        "desc": "Güvenlik ve dayanıklılık ön planda.",
        "rating": 4.2,
        "category": "elektronik",
        "subcategory": "cep-telefonu",
        "prices": generatePrices(16999)
    },
    {
        "id": "iphone-se-3",
        "name": "Apple iPhone SE (3. Nesil)",
        "price": 21999,
        "image": "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-se-2022.jpg",
        "desc": "Kompakt ve güçlü A15 çip.",
        "rating": 4.3,
        "category": "elektronik",
        "subcategory": "cep-telefonu",
        "prices": generatePrices(21999)
    },
    {
        "id": "vivo-v30-pro",
        "name": "vivo V30 Pro",
        "price": 34999,
        "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-v30-pro.jpg",
        "desc": "Profesyonel seviye portre aydınlatma.",
        "rating": 4.5,
        "category": "elektronik",
        "subcategory": "cep-telefonu",
        "prices": generatePrices(34999)
    },
    {
        "id": "samsung-galaxy-z-flip5",
        "name": "Samsung Galaxy Z Flip5",
        "price": 64999,
        "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-flip5.jpg",
        "desc": "Cebine sığan katlanabilir.",
        "rating": 4.6,
        "category": "elektronik",
        "subcategory": "cep-telefonu",
        "prices": generatePrices(64999)
    },
    {
        "id": "xiaomi-13t-pro-dup",
        "name": "Xiaomi 13T Pro",
        "price": 34999,
        "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-13t-pro.jpg",
        "desc": "Leica işbirliği ve 120W şarj.",
        "rating": 4.5,
        "category": "elektronik",
        "subcategory": "cep-telefonu",
        "prices": generatePrices(34999)
    },
    {
        "id": "oppo-a78",
        "name": "OPPO A78 5G",
        "price": 13999,
        "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-a78.jpg",
        "desc": "Uygun fiyatlı 5G deneyimi.",
        "rating": 4.1,
        "category": "elektronik",
        "subcategory": "cep-telefonu",
        "prices": generatePrices(13999)
    },
    {
        "id": "samsung-galaxy-m55",
        "name": "Samsung Galaxy M55 5G",
        "price": 18999,
        "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-m55.jpg",
        "desc": "Büyük ekran ve uzun pil.",
        "rating": 4.3,
        "category": "elektronik",
        "subcategory": "cep-telefonu",
        "prices": generatePrices(18999)
    },

    // --- TELEVIZYON ---
    {
        "id": "samsung-qled-qn90c",
        "name": "Samsung 65\" QLED 4K QN90C Smart TV",
        "price": 54999,
        "image": "https://images.samsung.com/is/image/samsung/p6pim/tr/qe65qn90catxtk/gallery/tr-qled-tv-qn90c-qe65qn90catxtk-536453959?$684_547_PNG$",
        "desc": "Muhteşem QLED görüntü ve Neo QLED teknolojisi.",
        "rating": 4.8,
        "category": "elektronik",
        "subcategory": "televizyon",
        "prices": generatePrices(54999)
    },
    {
        "id": "lg-oled-c3",
        "name": "LG 55\" OLED 4K evo C3 Smart TV",
        "price": 61999,
        "image": "",
        "desc": "Sonsuz kontrastlı OLED evo panel ve α9 işlemci.",
        "rating": 4.9,
        "category": "elektronik",
        "subcategory": "televizyon",
        "prices": generatePrices(61999)
    },
    {
        "id": "vestel-65u9500",
        "name": "Vestel 65\" 4K UHD Smart TV 65U9500",
        "price": 23999,
        "image": "",
        "desc": "Yerli üretim, büyük ekran ve akıllı özellikler.",
        "rating": 4.3,
        "category": "elektronik",
        "subcategory": "televizyon",
        "prices": generatePrices(23999)
    },
    {
        "id": "philips-oled-808",
        "name": "Philips 55\" OLED+ 4K 808 Smart TV",
        "price": 58999,
        "image": "",
        "desc": "Ambilight ve ses sistemi ile sürükleyici deneyim.",
        "rating": 4.7,
        "category": "elektronik",
        "subcategory": "televizyon",
        "prices": generatePrices(58999)
    },
    {
        "id": "samsung-crystal-4k-au8000",
        "name": "Samsung 55\" Crystal 4K AU8000 Smart TV",
        "price": 28999,
        "image": "",
        "desc": "Crystal görüntü işlemci ve Dynamic Crystal Color.",
        "rating": 4.5,
        "category": "elektronik",
        "subcategory": "televizyon",
        "prices": generatePrices(28999)
    },
    {
        "id": "lg-nanocell-75",
        "name": "LG 75\" NanoCell 4K 75NANO76SRA Smart TV",
        "price": 47999,
        "image": "",
        "desc": "Geniş açıdan mükemmel renkler, NanoCell teknolojisi.",
        "rating": 4.4,
        "category": "elektronik",
        "subcategory": "televizyon",
        "prices": generatePrices(47999)
    },
    {
        "id": "arcelik-a55-oled-pro",
        "name": "Arçelik 55\" OLED Pro Smart TV",
        "price": 45999,
        "image": "",
        "desc": "Yerli OLED teknolojisi ve AI ses-görüntü iyileştirme.",
        "rating": 4.6,
        "category": "elektronik",
        "subcategory": "televizyon",
        "prices": generatePrices(45999)
    },
    {
        "id": "xiaomi-mi-tv-p1",
        "name": "Xiaomi Mi TV P1 55\" 4K Android TV",
        "price": 18999,
        "image": "",
        "desc": "Uygun fiyatlı Android TV deneyimi ve 4K HDR.",
        "rating": 4.2,
        "category": "elektronik",
        "subcategory": "televizyon",
        "prices": generatePrices(18999)
    },
    {
        "id": "toshiba-55v35ke",
        "name": "Toshiba 55\" 4K UHD Smart TV 55V35KE",
        "price": 21999,
        "image": "",
        "desc": "REGZA Engine görüntü işlemci ve Dolby Audio.",
        "rating": 4.3,
        "category": "elektronik",
        "subcategory": "televizyon",
        "prices": generatePrices(21999)
    },
    {
        "id": "sony-bravia-x90l",
        "name": "Sony 65\" Bravia XR X90L 4K Smart TV",
        "price": 69999,
        "image": "",
        "desc": "Bilişsel işlemci XR ile gerçekçi görüntü ve ses.",
        "rating": 4.8,
        "category": "elektronik",
        "subcategory": "televizyon",
        "prices": generatePrices(69999)
    },

    // --- TABLET ---
    {
        "id": "samsung-galaxy-tab-s9-ultra",
        "name": "Samsung Galaxy Tab S9 Ultra",
        "price": 34999,
        "image": "",
        "desc": "En güçlü ve büyük ekranlı Samsung tablet.",
        "rating": 4.8,
        "category": "elektronik",
        "subcategory": "tablet",
        "prices": generatePrices(34999)
    },
    {
        "id": "apple-ipad-pro-129-m2",
        "name": "Apple iPad Pro 12.9\" (M2)",
        "price": 42999,
        "image": "",
        "desc": "M2 çip ile profesyonel performans.",
        "rating": 4.9,
        "category": "elektronik",
        "subcategory": "tablet",
        "prices": generatePrices(42999)
    },
    {
        "id": "samsung-galaxy-tab-s9-plus",
        "name": "Samsung Galaxy Tab S9+",
        "price": 27999,
        "image": "",
        "desc": "S Pen ile üretkenlik odaklı premium tablet.",
        "rating": 4.7,
        "category": "elektronik",
        "subcategory": "tablet",
        "prices": generatePrices(27999)
    },
    {
        "id": "apple-ipad-air-5",
        "name": "Apple iPad Air 5",
        "price": 22999,
        "image": "",
        "desc": "M1 çip, güçlü ve hafif.",
        "rating": 4.6,
        "category": "elektronik",
        "subcategory": "tablet",
        "prices": generatePrices(22999)
    },
    {
        "id": "lenovo-tab-p12-pro",
        "name": "Lenovo Tab P12 Pro",
        "price": 18999,
        "image": "",
        "desc": "OLED ekran ve kalem desteği ile çok yönlülük.",
        "rating": 4.4,
        "category": "elektronik",
        "subcategory": "tablet",
        "prices": generatePrices(18999)
    },
    {
        "id": "huawei-matepad-pro-13",
        "name": "Huawei MatePad Pro 13.2\"",
        "price": 25999,
        "image": "",
        "desc": "İnce çerçeveli, güçlü performanslı Huawei tableti.",
        "rating": 4.5,
        "category": "elektronik",
        "subcategory": "tablet",
        "prices": generatePrices(25999)
    },
    {
        "id": "apple-ipad-10nesil",
        "name": "Apple iPad 10. Nesil",
        "price": 14999,
        "image": "",
        "desc": "Renkli, modern tasarım ve A14 çip.",
        "rating": 4.3,
        "category": "elektronik",
        "subcategory": "tablet",
        "prices": generatePrices(14999)
    },
    {
        "id": "samsung-galaxy-tab-a9-plus",
        "name": "Samsung Galaxy Tab A9+",
        "price": 8999,
        "image": "",
        "desc": "Uygun fiyatlı, günlük kullanım için ideal.",
        "rating": 4.2,
        "category": "elektronik",
        "subcategory": "tablet",
        "prices": generatePrices(8999)
    },
    {
        "id": "xiaomi-pad-6",
        "name": "Xiaomi Pad 6",
        "price": 11999,
        "image": "",
        "desc": "Yüksek yenileme hızlı ekran, uygun fiyat.",
        "rating": 4.5,
        "category": "elektronik",
        "subcategory": "tablet",
        "prices": generatePrices(11999)
    },
    {
        "id": "amazon-fire-hd-10",
        "name": "Amazon Fire HD 10",
        "price": 3999,
        "image": "",
        "desc": "Ekonomik, Amazon içerikleri için mükemmel.",
        "rating": 4,
        "category": "elektronik",
        "subcategory": "tablet",
        "prices": generatePrices(3999)
    },

    // --- LAPTOP ---
    {
        "id": "apple-macbook-air-m2",
        "name": "Apple MacBook Air M2 13.6 inç",
        "price": 49999,
        "image": "",
        "desc": "M2 çip ile inanılmaz güç ve taşınabilirlik.",
        "rating": 4.8,
        "category": "elektronik",
        "subcategory": "laptop",
        "prices": generatePrices(49999)
    },
    {
        "id": "lenovo-ideapad-gaming-3",
        "name": "Lenovo IdeaPad Gaming 3 15.6 inç",
        "price": 32999,
        "image": "",
        "desc": "Oyun ve iş için mükemmel performans.",
        "rating": 4.5,
        "category": "elektronik",
        "subcategory": "laptop",
        "prices": generatePrices(32999)
    },
    {
        "id": "hp-pavilion-15",
        "name": "HP Pavilion 15-eg2007nt 15.6 inç",
        "price": 27999,
        "image": "",
        "desc": "Şık tasarım ve günlük kullanım performansı.",
        "rating": 4.3,
        "category": "elektronik",
        "subcategory": "laptop",
        "prices": generatePrices(27999)
    },
    {
        "id": "asus-rog-strix-g15",
        "name": "ASUS ROG Strix G15 G513RC-HN077 15.6 inç",
        "price": 41999,
        "image": "",
        "desc": "Üst düzey oyun deneyimi için ROG gücü.",
        "rating": 4.7,
        "category": "elektronik",
        "subcategory": "laptop",
        "prices": generatePrices(41999)
    },
    {
        "id": "acer-nitro-5-an515-58",
        "name": "Acer Nitro 5 AN515-58 15.6 inç",
        "price": 35999,
        "image": "",
        "desc": "Oyun tutkunları için güçlü ve uygun fiyatlı.",
        "rating": 4.4,
        "category": "elektronik",
        "subcategory": "laptop",
        "prices": generatePrices(35999)
    },
    {
        "id": "dell-inspiron-15-3520",
        "name": "Dell Inspiron 15 3520 15.6 inç",
        "price": 23999,
        "image": "",
        "desc": "Güvenilir ve verimli günlük kullanım notebook'u.",
        "rating": 4.2,
        "category": "elektronik",
        "subcategory": "laptop",
        "prices": generatePrices(23999)
    },
    {
        "id": "msi-katana-gf66",
        "name": "MSI Katana GF66 12UC-621XTR 15.6 inç",
        "price": 38999,
        "image": "",
        "desc": "İnce tasarımda yüksek oyun performansı.",
        "rating": 4.6,
        "category": "elektronik",
        "subcategory": "laptop",
        "prices": generatePrices(38999)
    },
    {
        "id": "apple-macbook-pro-14-m3",
        "name": "Apple MacBook Pro 14 inç M3",
        "price": 89999,
        "image": "",
        "desc": "Profesyoneller için nihai yaratıcı araç.",
        "rating": 4.9,
        "category": "elektronik",
        "subcategory": "laptop",
        "prices": generatePrices(89999)
    },
    {
        "id": "asus-vivobook-pro-15",
        "name": "ASUS Vivobook Pro 15 OLED K6502ZC-MA043W 15.6 inç",
        "price": 34999,
        "image": "",
        "desc": "Harika OLED ekran ve içerik oluşturma gücü.",
        "rating": 4.5,
        "category": "elektronik",
        "subcategory": "laptop",
        "prices": generatePrices(34999)
    },
    {
        "id": "lenovo-thinkpad-e15",
        "name": "Lenovo ThinkPad E15 Gen 4 15.6 inç",
        "price": 29999,
        "image": "",
        "desc": "İş dünyası için dayanıklı ve güvenilir.",
        "rating": 4.4,
        "category": "elektronik",
        "subcategory": "laptop",
        "prices": generatePrices(29999)
    },

    // --- KURUTMA MAKINESI ---
    {
        "id": "bosch-serie-4-wtw875w1tr",
        "name": "Bosch Serie 4 WTW875W1TR A+++ 9 kg Kurutma Makinesi",
        "price": 29999,
        "image": "https://media3.bsh-group.com/Product_Shots/1600x900/MCSA00753086_WTW85410TR_def.jpg",
        "desc": "Enerji tasarruflu, sessiz ve yüksek kapasiteli.",
        "rating": 4.6,
        "category": "elektronik",
        "subcategory": "kurutma-makinesi",
        "prices": generatePrices(29999)
    },
    {
        "id": "samsung-dv90ta040ae-tk",
        "name": "Samsung DV90TA040AE/TK Heat Pump 9 kg Kurutma Makinesi",
        "price": 34999,
        "image": "",
        "desc": "Isı pompalı teknoloji ile enerji tasarrufu.",
        "rating": 4.8,
        "category": "elektronik",
        "subcategory": "kurutma-makinesi",
        "prices": generatePrices(34999)
    },
    {
        "id": "arcelik-9143-ykm-a",
        "name": "Arçelik 9143 YKM A+++ 9 kg Kurutma Makinesi",
        "price": 27999,
        "image": "",
        "desc": "Yüksek kurutma performansı ve sessiz çalışma.",
        "rating": 4.5,
        "category": "elektronik",
        "subcategory": "kurutma-makinesi",
        "prices": generatePrices(27999)
    },
    {
        "id": "profilo-cd93p3tr",
        "name": "Profilo CD93P3TR A+++ 9 kg Kurutma Makinesi",
        "price": 23999,
        "image": "",
        "desc": "Güvenilir ve ekonomik kurutma çözümü.",
        "rating": 4.4,
        "category": "elektronik",
        "subcategory": "kurutma-makinesi",
        "prices": generatePrices(23999)
    },
    {
        "id": "vestel-km-9101-a",
        "name": "Vestel KM 9101 A+++ 9 kg Kurutma Makinesi",
        "price": 19999,
        "image": "",
        "desc": "Uygun fiyatlı, yüksek performanslı kurutucu.",
        "rating": 4.3,
        "category": "elektronik",
        "subcategory": "kurutma-makinesi",
        "prices": generatePrices(19999)
    },
    {
        "id": "lg-rc90v9av2w",
        "name": "LG RC90V9AV2W Heat Pump 9 kg Kurutma Makinesi",
        "price": 36999,
        "image": "",
        "desc": "Buharlı ve ısı pompalı akıllı kurutma.",
        "rating": 4.7,
        "category": "elektronik",
        "subcategory": "kurutma-makinesi",
        "prices": generatePrices(36999)
    },
    {
        "id": "altus-al-9101-a",
        "name": "Altus AL 9101 A A+++ 9 kg Kurutma Makinesi",
        "price": 21999,
        "image": "",
        "desc": "Pratik ve dayanıklı kurutma makinesi.",
        "rating": 4.2,
        "category": "elektronik",
        "subcategory": "kurutma-makinesi",
        "prices": generatePrices(21999)
    },
    {
        "id": "grundig-gtn-99220-a",
        "name": "Grundig GTN 99220 A+++ 9 kg Kurutma Makinesi",
        "price": 28999,
        "image": "",
        "desc": "Hassas kumaşlar için özel programlar.",
        "rating": 4.5,
        "category": "elektronik",
        "subcategory": "kurutma-makinesi",
        "prices": generatePrices(28999)
    },
    {
        "id": "beko-d-8101-a",
        "name": "Beko D 8101 A A+++ 8 kg Kurutma Makinesi",
        "price": 22999,
        "image": "",
        "desc": "Kompakt tasarım, yüksek verimlilik.",
        "rating": 4.4,
        "category": "elektronik",
        "subcategory": "kurutma-makinesi",
        "prices": generatePrices(22999)
    },
    {
        "id": "siemens-wt47wh0tr",
        "name": "Siemens WT47WH0TR iQ500 A+++ 9 kg Kurutma Makinesi",
        "price": 32999,
        "image": "",
        "desc": "Profesyonel kurutma performansı ve sessizlik.",
        "rating": 4.7,
        "category": "elektronik",
        "subcategory": "kurutma-makinesi",
        "prices": generatePrices(32999)
    },

    // --- KARIŞIK DİĞER KATEGORİLER (ESKİ VERİLERDEN) ---
    { id: "airpods-pro-2", name: "AirPods Pro 2. Nesil", category: "elektronik", subcategory: "bluetooth-kulaklik", price: 9000, image: "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/MQD83?wid=1144&hei=1144&fmt=jpeg&qlt=95&.v=1660803972361", desc: "Aktif gürültü engelleme, uzamsal ses.", rating: 4.8, prices: generatePrices(9000) },
    { id: "sony-wh1000xm5", name: "Sony WH-1000XM5", category: "elektronik", subcategory: "bluetooth-kulaklik", price: 12500, image: "https://www.sony.com.tr/image/6145c1d32e6ac8e63a46c912ef878ce3?fmt=pjpeg&wid=330&bgcolor=FFFFFF&bgc=FFFFFF", desc: "Sektör lideri NC.", rating: 4.7, prices: generatePrices(12500) },
    { id: "samsung-buds-2-pro", name: "Samsung Galaxy Buds2 Pro", category: "elektronik", subcategory: "bluetooth-kulaklik", price: 4500, image: "https://images.samsung.com/is/image/samsung/p6pim/tr/2208/gallery/tr-galaxy-buds2-pro-r510-sm-r510nzaatur-533190874?$684_547_PNG$", desc: "24-bit Hi-Fi ses.", rating: 4.4, prices: generatePrices(4500) },

    { id: "msi-raider", name: "MSI Raider GE78", category: "elektronik", subcategory: "oyun-bilgisayari", price: 110000, image: "https://asset.msi.com/resize/image/global/product/notebook/Raider-GE78-HX-13V-20221221.png624053898624053898/1024.png", desc: "RTX 4080, i9 işlemci, RGB şöleni.", rating: 4.8, prices: generatePrices(110000) },
    { id: "monster-tulpar", name: "Monster Tulpar T7", category: "elektronik", subcategory: "oyun-bilgisayari", price: 65000, image: "https://www.monsternotebook.com.tr/UPLOAD/urun-gorselleri-yeni/TULPAR/T7_V20/thumb/01_large.png", desc: "Yerli canavar, RTX 4070.", rating: 4.5, prices: generatePrices(65000) },

    { id: "samsung-odyssey-g9", name: "Samsung Odyssey G9 OLED", category: "elektronik", subcategory: "monitor", price: 45000, image: "https://images.samsung.com/is/image/samsung/p6pim/tr/ls49cg954suxuf/gallery/tr-odyssey-oled-g9-g95sc-ls49cg954suxuf-537064805?$684_547_PNG$", desc: "49 inç ultra geniş kavisli.", rating: 4.9, prices: generatePrices(45000) },
    { id: "lg-ultragear", name: "LG UltraGear 27GR95QE", category: "elektronik", subcategory: "monitor", price: 28000, image: "https://www.lg.com/content/dam/channel/wcms/tr/images/monitor/27gr95qe-b_atrq_e_m_1/gallery/medium01.jpg", desc: "27 inç OLED, 240Hz.", rating: 4.8, prices: generatePrices(28000) },

    { id: "dyson-gen5", name: "Dyson Gen5detect", category: "ev-yasam", subcategory: "dikey-supurge", price: 35000, image: "https://dyson-h.assetsadobe2.com/is/image/content/dam/dyson/products/vacuum-cleaners/cordless/gen5/sv23/pdp/colourway-images/Gen5-Prussian-Blue-Copper-LB.png?scl=1&fmt=png-alpha", desc: "En güçlü Dyson, mikroskobik toz tespiti.", rating: 4.9, prices: generatePrices(35000) },

    { id: "roborock-s8", name: "Roborock S8 Pro Ultra", category: "ev-yasam", subcategory: "robot-supurge", price: 42000, image: "https://m.media-amazon.com/images/I/61k1K-jXW+L._AC_SL1500_.jpg", desc: "Tam otomatik istasyon, çift fırça.", rating: 4.9, prices: generatePrices(42000) },

    { id: "rtx-4090", name: "MSI GeForce RTX 4090", category: "elektronik", subcategory: "ekran-karti", price: 95000, image: "https://asset.msi.com/resize/image/global/product/vga/GeForce-RTX-4090-GAMING-X-TRIO-24G-1.png624053898624053898/600.png", desc: "Dünyanın en güçlüsü.", rating: 5.0, prices: generatePrices(95000) },

    { id: "apple-watch-ultra-2", name: "Apple Watch Ultra 2", category: "elektronik", subcategory: "akilli-saat", price: 40000, image: "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/watch-ultra2-digitalmat-gallery-1-202409?wid=728&hei=666&fmt=png-alpha&.v=1725062630324", desc: "Maceracılar için en dayanıklı saat.", rating: 4.9, prices: generatePrices(40000) },
    { id: "samsung-watch-6-classic", name: "Samsung Galaxy Watch 6 Classic", category: "elektronik", subcategory: "akilli-saat", price: 9000, image: "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-watch6-classic.jpg", desc: "Döner çerçeve geri döndü.", rating: 4.5, prices: generatePrices(9000) },

    // --- EV / MODA ---
    { id: "nike-air-max", name: "Nike Air Max", category: "moda", price: 4500, image: "👟", desc: "Günlük kullanım için ikonik tasarım.", rating: 4.5, prices: generatePrices(4500) },
    { id: "zara-blazer", name: "Zara Blazer Ceket", category: "moda", price: 3200, image: "🧥", desc: "Ofis şıklığı için modern kesim.", rating: 4.3, prices: generatePrices(3200) },
    { id: "philips-airfryer", name: "Philips Airfryer XXL", category: "ev-yasam", price: 8500, image: "🍟", desc: "Az yağ ile çıtır lezzetler.", rating: 4.8, prices: generatePrices(8500) },
];
