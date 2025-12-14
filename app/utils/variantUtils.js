export const colorPattern = /(Siyah|Beyaz|Mavi|Kırmızı|Yeşil|Sarı|Mor|Gri|Gümüş|Altın|Pembe|Turuncu|Lacivert|Krem|Bej|Bordo|Black|White|Blue|Red|Green|Yellow|Purple|Grey|Silver|Gold|Pink|Orange|Navy|Cream|Beige|Midnight|Starlight|Graphite|Space|Titanium|Natural|Sierra|Alpine|Deep|Jet|Mat|Parlak|Rose|Dark|Light|Titanyum|Gece|Yıldız|Uzay|Menekşe|Okyanus|Kehribar|Bakır|Zümrüt|Safir|Işığı|Yarısı)/gi;

export const getBaseName = (name) => {
    if (!name || typeof name !== 'string') return "";
    return name
        .toLowerCase()
        .replace(/^(apple|samsung|xiaomi|huawei|oppo|vivo|realme|oneplus|general mobile|reeder|casper|honor|poco|tecno|infinix|google|asus|sony|vestel|omix|monster|lenovo|hp|acer|dell|msi|dyosn|philips|roborock|vestel|profilo|arçelik|beko|bosch|siemens|lg|sony)\s+/gi, '')
        .replace(/\s(16|32|64|128|256|512)\s?gb|1\s?tb/gi, '')
        .replace(/\s\d{1,2}\s?gb\s?ram/gi, '')
        .replace(colorPattern, '')
        .replace(/(\s|^)(5g|4g|lte)(\s|$)/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
};
