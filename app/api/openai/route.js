import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { generateAssistantText, parseMaybeJson } from '@/app/utils/ai/provider';

const MAX_PROMPT_CHARS = 600;
const MAX_MESSAGES = 12;
const MAX_MESSAGE_CHARS = 600;
const PRODUCT_CACHE_TTL_MS = 2 * 60 * 1000;
let productsCache = { ts: 0, rows: null, inFlight: null };

const slugifyTr = (value = '') => value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

const parseNumericPrice = (raw) => {
    if (raw == null) return NaN;
    if (typeof raw === 'number') return raw;
    const cleaned = String(raw).replace(/\./g, '').replace(',', '.').replace(/[^0-9.]/g, '');
    const parsed = Number.parseFloat(cleaned);
    return Number.isFinite(parsed) ? parsed : NaN;
};

const extractBudget = (text = '') => {
    const normalized = text.toLowerCase();
    const withBin = normalized.match(/(\d+[.,]?\d*)\s*(bin(?:e|lik|den|in|im)?|k)\b/);
    if (withBin) {
        const amount = Number.parseFloat(withBin[1].replace(',', '.'));
        return Number.isFinite(amount) ? Math.round(amount * 1000) : null;
    }

    const withTl = normalized.match(/(\d{4,6})\s*(tl|₺)?/);
    if (withTl) {
        const amount = Number.parseInt(withTl[1], 10);
        return Number.isFinite(amount) ? amount : null;
    }

    return null;
};

const CATEGORY_RULES = [
    {
        id: 'telefon',
        label: 'telefon',
        keywords: ['telefon', 'cep telefonu', 'akilli telefon', 'akıllı telefon', 'phone', 'iphone', 'android', 'gsm', 'smartphone'],
        excludes: ['tablet', 'televizyon', 'tv', 'laptop', 'notebook', 'kulaklik', 'kulaklık', 'monitor']
    },
    {
        id: 'laptop',
        label: 'laptop',
        keywords: ['laptop', 'notebook', 'dizüstü', 'dizustu', 'ultrabook', 'macbook'],
        excludes: []
    },
    {
        id: 'tablet',
        label: 'tablet',
        keywords: ['tablet', 'ipad'],
        excludes: []
    },
    {
        id: 'televizyon',
        label: 'televizyon',
        keywords: ['televizyon', 'tv', 'oled', 'qled'],
        excludes: []
    },
    {
        id: 'kulaklik',
        label: 'kulaklık',
        keywords: ['kulaklik', 'kulaklık', 'earbuds', 'headset', 'headphone', 'airpods'],
        excludes: []
    },
    {
        id: 'monitor',
        label: 'monitör',
        keywords: ['monitor', 'monitör', 'oyuncu monitörü', 'gaming monitor'],
        excludes: []
    },
    {
        id: 'kamera',
        label: 'kamera',
        keywords: ['kamera', 'camera', 'dslr', 'ayna', 'aksiyon kamera', 'action cam', 'gopro'],
        excludes: []
    },
    {
        id: 'akilli-saat',
        label: 'akıllı saat',
        keywords: ['akilli saat', 'akıllı saat', 'smart watch', 'smartwatch', 'watch'],
        excludes: []
    },
    {
        id: 'oyun-konsolu',
        label: 'oyun konsolu',
        keywords: ['oyun konsolu', 'konsol', 'playstation', 'xbox', 'nintendo switch', 'ps5'],
        excludes: []
    },
    {
        id: 'hoparlor',
        label: 'hoparlör',
        keywords: ['hoparlor', 'hoparlör', 'speaker', 'bluetooth speaker', 'soundbar'],
        excludes: []
    },
    {
        id: 'aksesuar',
        label: 'aksesuar',
        keywords: ['mouse', 'fare', 'klavye', 'keyboard', 'mikrofon', 'microphone', 'webcam'],
        excludes: []
    },
    {
        id: 'supurge',
        label: 'robot süpürge',
        keywords: ['robot supurge', 'robot süpürge', 'supurge', 'süpürge', 'vacuum'],
        excludes: []
    }
];

const BRAND_KEYWORDS = [
    'apple', 'samsung', 'xiaomi', 'huawei', 'honor', 'oppo', 'vivo', 'realme',
    'asus', 'acer', 'lenovo', 'hp', 'dell', 'msi', 'casper', 'monster',
    'sony', 'jbl', 'anker', 'marshall', 'bose', 'lg', 'philips', 'dyson', 'roborock'
];

const BRAND_DISPLAY_MAP = {
    apple: 'Apple',
    samsung: 'Samsung',
    xiaomi: 'Xiaomi',
    huawei: 'Huawei',
    honor: 'Honor',
    oppo: 'OPPO',
    vivo: 'vivo',
    realme: 'realme',
    asus: 'ASUS',
    acer: 'Acer',
    lenovo: 'Lenovo',
    hp: 'HP',
    dell: 'Dell',
    msi: 'MSI',
    casper: 'Casper',
    monster: 'Monster',
    sony: 'Sony',
    jbl: 'JBL',
    anker: 'Anker',
    marshall: 'Marshall',
    bose: 'Bose',
    lg: 'LG',
    philips: 'Philips',
    dyson: 'Dyson',
    roborock: 'Roborock'
};

const formatBrandDisplay = (brand = '') => BRAND_DISPLAY_MAP[brand] || (brand ? brand.charAt(0).toUpperCase() + brand.slice(1) : brand);

const FEATURE_RULES = [
    { id: 'camera', label: 'kamera', keywords: ['kamera', 'fotoğraf', 'video', 'çekim'] },
    { id: 'battery', label: 'batarya', keywords: ['batarya', 'pil', 'şarj', 'sarj'] },
    { id: 'performance', label: 'performans', keywords: ['performans', 'hız', 'hiz', 'oyun', 'gaming'] },
    { id: 'screen', label: 'ekran', keywords: ['ekran', 'amoled', 'oled', 'retina', 'hz'] },
    { id: 'storage', label: 'depolama', keywords: ['depolama', 'hafıza', 'hafiza', 'gb', 'tb'] },
    { id: 'ram', label: 'ram', keywords: ['ram', 'çoklu görev', 'coklu gorev'] },
    { id: 'price_perf', label: 'fiyat/performans', keywords: ['fiyat performans', 'fp', 'uygun fiyat'] }
];

const tokenizePrompt = (text = '') => String(text)
    .toLowerCase()
    .replace(/[^a-z0-9ğüşiöç\s]/gi, ' ')
    .split(/\s+/)
    .filter(Boolean);

const hasKeywordMatch = (text = '', keywords = []) => {
    const normalized = String(text || '').toLowerCase();
    return Array.isArray(keywords) && keywords.some((keyword) => normalized.includes(String(keyword).toLowerCase()));
};

const isLikelyFollowUpPrompt = (text = '') => {
    const tokens = tokenizePrompt(text);
    if (tokens.length === 0) return false;
    if (tokens.length > 8) return false;
    if (isGreeting(text)) return false;
    return true;
};

const sanitizeInput = (text = '') => String(text)
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const isAllowedOrigin = (request) => {
    const origin = request.headers.get('origin');
    if (!origin) return true;
    try {
        const originUrl = new URL(origin);
        const host = request.headers.get('host') || '';
        const hostNoPort = host.split(':')[0];
        const originHostNoPort = originUrl.host.split(':')[0];
        return hostNoPort === originHostNoPort;
    } catch {
        return false;
    }
};

const sanitizeMessages = (messages) => {
    if (!Array.isArray(messages)) return null;

    const allowedRoles = new Set(['system', 'user', 'assistant']);
    const safe = [];
    for (const msg of messages.slice(-MAX_MESSAGES)) {
        const role = String(msg?.role || '').toLowerCase();
        const content = sanitizeInput(String(msg?.content || ''));
        if (!allowedRoles.has(role) || !content) continue;
        safe.push({ role, content: content.slice(0, MAX_MESSAGE_CHARS) });
    }
    return safe.length > 0 ? safe : null;
};

const getCachedProducts = async () => {
    const now = Date.now();
    if (productsCache.rows && (now - productsCache.ts) < PRODUCT_CACHE_TTL_MS) {
        return productsCache.rows;
    }

    if (productsCache.inFlight) {
        return productsCache.inFlight;
    }

    productsCache.inFlight = (async () => {
        const { data, error } = await supabaseAdmin
            .from('products')
            .select('*')
            .limit(1200);

        if (error || !Array.isArray(data)) {
            console.error('Cached products fetch error:', error);
            return [];
        }

        productsCache = { ts: Date.now(), rows: data, inFlight: null };
        return data;
    })();

    const rows = await productsCache.inFlight;
    productsCache.inFlight = null;
    return rows;
};

const extractBrandPrefs = (text = '') => {
    const normalized = text.toLowerCase();
    return BRAND_KEYWORDS.filter((brand) => normalized.includes(brand));
};

const extractFeaturePrefs = (text = '') => {
    const normalized = text.toLowerCase();
    return FEATURE_RULES
        .filter((rule) => rule.keywords.some((keyword) => normalized.includes(keyword)))
        .map((rule) => rule.id);
};

const canonicalProductName = (name = '') => {
    const normalized = String(name)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\(.*?\)/g, ' ')
        .replace(/\b\d+\s?(gb|tb|mb)\b/g, ' ')
        .replace(/\b\d+\s?ram\b/g, ' ')
        .replace(/\b\d+\s?\+\s?\d+\b/g, ' ')
        .replace(/\b(5g|4g|lte|nfc|dual\s?sim|tek\s?sim|cift\s?sim|çift\s?sim)\b/g, ' ')
        .replace(/\b(siyah|black|beyaz|white|mavi|blue|yesil|yesıl|yeşil|green|kirmizi|kırmızı|red|mor|purple|pembe|pink|gri|gray|grey|silver|gold|altin|altın|midnight|starlight|graphite|space\s?gray|uzay\s?grisi|titanyum|titanium)\b/g, ' ')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    return normalized;
};

const VARIANT_TOKENS = new Set([
    'gb', 'tb', 'mb', 'ram',
    'siyah', 'black', 'beyaz', 'white', 'mavi', 'blue', 'yesil', 'yesil', 'green', 'kirmizi', 'kirmizi', 'red',
    'mor', 'purple', 'pembe', 'pink', 'gri', 'gray', 'grey', 'silver', 'gold', 'altin', 'altn',
    'midnight', 'starlight', 'graphite', 'uzay', 'grisi', 'titanyum', 'titanium',
    '5g', '4g', 'lte', 'nfc', 'dualsim', 'dual', 'sim', 'tek', 'cift', 'ciftsim'
]);

const toCanonicalModelKey = (item = {}) => {
    const familySource = slugifyTr(item?.productFamilyKey || '');
    const slugSource = slugifyTr(item?.slug || item?.name || '');
    const nameSource = canonicalProductName(item?.name || '');

    const tokenize = (value) => String(value).split(/[-\s]+/).filter(Boolean);

    const fromFamily = tokenize(familySource);
    const fromSlug = tokenize(slugSource);
    const fromName = tokenize(nameSource);
    const tokens = fromFamily.length > 0 ? fromFamily : (fromSlug.length > 0 ? fromSlug : fromName);

    const filtered = [];
    for (let i = 0; i < tokens.length; i += 1) {
        const token = tokens[i];
        const next = tokens[i + 1];

        if (/^\d+$/.test(token) && (next === 'gb' || next === 'tb' || next === 'mb' || next === 'ram')) {
            i += 1;
            continue;
        }

        if (VARIANT_TOKENS.has(token)) continue;
        filtered.push(token);
    }

    return filtered.join(' ').trim() || nameSource || slugSource;
};

const pickUniqueSuggestions = ({ items = [], count = 3, budget, brandPrefs = [], featurePrefs = [] }) => {
    const picked = [];
    const seen = new Set();

    for (const item of items) {
        const canon = toCanonicalModelKey(item);
        if (!canon || seen.has(canon)) continue;
        seen.add(canon);
        picked.push({
            id: String(item.id || item.slug || item.name),
            slug: item.slug,
            subcategory: item.subcategory,
            image: item.image,
            name: item.name,
            price: item.price,
            url: item.url,
            reason: buildSuggestionReason({ product: item, budget, brandPrefs, featurePrefs, row: item.row })
        });
        if (picked.length === count) break;
    }

    return picked;
};

const flattenObjectValues = (value) => {
    if (value == null) return [];
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        return [String(value)];
    }
    if (Array.isArray(value)) {
        return value.flatMap((entry) => flattenObjectValues(entry));
    }
    if (typeof value === 'object') {
        return Object.entries(value).flatMap(([key, val]) => [String(key), ...flattenObjectValues(val)]);
    }
    return [];
};

const extractBatteryMah = (row = {}, product = {}) => {
    const candidates = [
        row?.battery,
        row?.battery_mah,
        row?.batteryMah,
        row?.gsmarena_data,
        row?.specs,
        row?.desc,
        row?.description,
        product?.name
    ];

    const text = candidates.flatMap((entry) => flattenObjectValues(entry)).join(' ').toLowerCase();
    const matches = [...text.matchAll(/(\d{3,5})\s?mah/g)].map((match) => Number.parseInt(match[1], 10));
    const valid = matches.filter((value) => Number.isFinite(value) && value >= 2500 && value <= 10000);

    if (valid.length === 0) return null;
    return Math.max(...valid);
};

const getBatteryFeatureScore = (row, product) => {
    const mah = extractBatteryMah(row, product);
    if (!mah) return { score: 0, mah: null };

    if (mah >= 6000) return { score: 22, mah };
    if (mah >= 5000) return { score: 16, mah };
    if (mah >= 4500) return { score: 11, mah };
    if (mah >= 4000) return { score: 7, mah };
    return { score: 3, mah };
};

const extractScreenRefreshHz = (row = {}, product = {}) => {
    const candidates = [
        row?.display_hz,
        row?.refresh_rate,
        row?.gsmarena_data,
        row?.specs,
        row?.desc,
        row?.description,
        product?.name
    ];

    const text = candidates.flatMap((entry) => flattenObjectValues(entry)).join(' ').toLowerCase();
    const matches = [...text.matchAll(/(\d{2,3})\s?hz/g)].map((match) => Number.parseInt(match[1], 10));
    const valid = matches.filter((value) => Number.isFinite(value) && value >= 50 && value <= 360);

    if (valid.length === 0) return null;
    return Math.max(...valid);
};

const extractScreenResolutionTier = (row = {}, product = {}) => {
    const candidates = [row?.resolution, row?.gsmarena_data, row?.specs, row?.desc, row?.description, product?.name];
    const text = candidates.flatMap((entry) => flattenObjectValues(entry)).join(' ').toLowerCase();

    if (/\b(4k|uhd|3840\s*x\s*2160)\b/.test(text)) return 5;
    if (/\b(qhd|2k|wqhd|2560\s*x\s*1440)\b/.test(text)) return 4;
    if (/\b(fhd|1080p|1920\s*x\s*1080)\b/.test(text)) return 3;
    if (/\b(hd|720p|1366\s*x\s*768)\b/.test(text)) return 2;
    return null;
};

const getScreenFeatureScore = (row, product) => {
    const hz = extractScreenRefreshHz(row, product);
    const resolutionTier = extractScreenResolutionTier(row, product);
    let score = 0;

    if (hz) {
        if (hz >= 165) score += 14;
        else if (hz >= 144) score += 12;
        else if (hz >= 120) score += 10;
        else if (hz >= 90) score += 7;
        else if (hz >= 60) score += 4;
    }

    if (resolutionTier) {
        score += resolutionTier * 2;
    }

    return { score, hz, resolutionTier };
};

const extractGpuModel = (row = {}, product = {}) => {
    const candidates = [row?.gpu, row?.graphics, row?.specs, row?.gsmarena_data, row?.desc, row?.description, product?.name];
    const text = candidates.flatMap((entry) => flattenObjectValues(entry)).join(' ');
    const match = text.match(/\b(rtx\s?\d{3,4}|gtx\s?\d{3,4}|rx\s?\d{3,4}m?|mx\s?\d{3,4}|arc\s?[a-z0-9\-+ ]{1,12})\b/i);
    return match ? match[1].replace(/\s+/g, ' ').trim().toUpperCase() : null;
};

const extractGpuTdpWatt = (row = {}, product = {}) => {
    const candidates = [row?.gpu_tdp, row?.tdp, row?.specs, row?.desc, row?.description, product?.name];
    const text = candidates.flatMap((entry) => flattenObjectValues(entry)).join(' ').toLowerCase();
    const match = text.match(/\b(\d{2,3})\s?(w|watt|tdp|tgp)\b/);
    if (!match) return null;
    const value = Number.parseInt(match[1], 10);
    if (!Number.isFinite(value) || value < 10 || value > 300) return null;
    return value;
};

const getGpuTier = (gpuModel = '') => {
    const model = String(gpuModel || '').toUpperCase();
    if (!model) return null;

    if (model.includes('RTX 4090')) return 45;
    if (model.includes('RTX 4080')) return 42;
    if (model.includes('RTX 4070')) return 38;
    if (model.includes('RTX 4060')) return 34;
    if (model.includes('RTX 4050')) return 30;
    if (model.includes('RTX 30')) return 28;
    if (model.includes('RX 7900')) return 41;
    if (model.includes('RX 7800')) return 37;
    if (model.includes('RX 7700')) return 35;
    if (model.includes('RX 7600')) return 33;
    if (model.includes('ARC')) return 22;
    if (model.includes('GTX 1660')) return 21;
    if (model.includes('GTX 1650')) return 18;
    if (model.includes('MX')) return 12;
    if (model.includes('RTX')) return 24;
    if (model.includes('GTX')) return 16;
    if (model.includes('RX')) return 20;
    return 10;
};

const getPerformanceFeatureScore = (row, product) => {
    const text = getProductTextBlob(product, row);
    if (!/laptop|notebook|dizustu|dizüstü|bilgisayar|gaming/.test(text)) {
        return { score: 0, gpuModel: null, gpuTier: null, gpuTdpWatt: null };
    }
    const gpuModel = extractGpuModel(row, product);
    const gpuTier = getGpuTier(gpuModel);
    const gpuTdpWatt = extractGpuTdpWatt(row, product);

    let score = 0;
    if (gpuTier) score += Math.min(20, Math.round(gpuTier / 2));
    if (gpuTdpWatt) score += Math.min(8, Math.round(gpuTdpWatt / 20));

    if (/\b(ultra\s?9|i9|ryzen\s?9|m3\s?max|m4\s?max)\b/.test(text)) score += 8;
    else if (/\b(ultra\s?7|i7|ryzen\s?7|m3\s?pro|m4\s?pro)\b/.test(text)) score += 6;
    else if (/\b(ultra\s?5|i5|ryzen\s?5|m3|m4)\b/.test(text)) score += 4;

    return { score, gpuModel, gpuTier, gpuTdpWatt };
};

const getProductTextBlob = (product, row) => {
    return [
        product.name,
        row?.desc,
        row?.description,
        Array.isArray(row?.specs) ? row.specs.join(' ') : row?.specs,
        row?.subcategory,
        row?.category
    ].filter(Boolean).join(' ').toLowerCase();
};

const buildSuggestionReason = ({ product, budget, brandPrefs, featurePrefs, row }) => {
    const parts = [];
    const textBlob = getProductTextBlob(product, row);

    if (brandPrefs.length > 0 && brandPrefs.some((brand) => product.name.toLowerCase().includes(brand))) {
        parts.push(`Tercih ettiğin ${formatBrandDisplay(brandPrefs[0])} markasına yakın.`);
    }

    if (featurePrefs.length > 0) {
        const matchedFeatures = FEATURE_RULES
            .filter((rule) => featurePrefs.includes(rule.id) && rule.keywords.some((keyword) => textBlob.includes(keyword)))
            .map((rule) => rule.label)
            .slice(0, 2);

        if (featurePrefs.includes('battery')) {
            const batterySignal = getBatteryFeatureScore(row, product);
            if (batterySignal.mah) {
                parts.push(`Batarya kapasitesi yaklaşık ${batterySignal.mah.toLocaleString('tr-TR')} mAh.`);
            }
        }

        if (featurePrefs.includes('screen')) {
            const screenSignal = getScreenFeatureScore(row, product);
            if (screenSignal.hz) {
                parts.push(`Ekran tazeleme hızı yaklaşık ${screenSignal.hz} Hz.`);
            }
        }

        if (featurePrefs.includes('performance')) {
            const perfSignal = getPerformanceFeatureScore(row, product);
            if (perfSignal.gpuModel) {
                parts.push(`Grafik birimi: ${perfSignal.gpuModel}.`);
            }
        }

        if (matchedFeatures.length > 0) {
            parts.push(`${matchedFeatures.join(' + ')} odağına daha uygun.`);
        }
    }

    if (budget) {
        if (product.price <= budget) {
            parts.push('Bütçenin içinde kalıyor.');
        } else {
            parts.push('Bütçene çok yakın güçlü bir alternatif.');
        }
    }

    return parts.length > 0 ? parts.join(' ') : 'Genel ihtiyaçlarına uygun dengeli bir alternatif.';
};

const detectCategoryIntent = (text = '') => {
    const normalized = text.toLowerCase();
    let bestRule = null;
    let bestScore = 0;

    for (const rule of CATEGORY_RULES) {
        const score = rule.keywords.reduce((acc, keyword) => acc + (normalized.includes(keyword) ? 1 : 0), 0);
        if (score > bestScore) {
            bestScore = score;
            bestRule = rule;
        }
    }

    return bestScore > 0 ? bestRule : null;
};

const isExplicitCameraDeviceIntent = (text = '') => {
    const normalized = text.toLowerCase();
    return /(fotoğraf makinesi|fotograf makinesi|dslr|ayna[sz]iz|aksiyon kamera|action cam|gopro|kamera öner|kamera oner|kamera al)/.test(normalized);
};

const getLastUserCategoryIntent = (safeMessages = [], { excludeCurrentPrompt = '' } = {}) => {
    if (!Array.isArray(safeMessages) || safeMessages.length === 0) return null;

    const excluded = String(excludeCurrentPrompt || '').trim().toLowerCase();
    for (let index = safeMessages.length - 1; index >= 0; index -= 1) {
        const msg = safeMessages[index];
        if (msg?.role !== 'user') continue;

        const content = String(msg?.content || '').trim();
        if (!content) continue;
        if (excluded && content.toLowerCase() === excluded) continue;

        const intent = detectCategoryIntent(content);
        if (intent) return intent;
    }

    return null;
};

const isGreeting = (text = '') => /^(selam|merhaba|slm|sa|hey|naber|nasilsin|nasılsın|iyi misin)\b/.test(text.trim().toLowerCase());

const GREETING_EXAMPLES = [
    '25.000 TL bütçe ile laptop öner',
    '15.000 TL altı telefon öner',
    '10.000 TL bütçe ile akıllı saat öner',
    '20.000 TL bandında oyun konsolu öner',
    '8.000 TL bütçe ile kulaklık öner'
];

const getRandomGreetingExample = () => {
    const index = Math.floor(Math.random() * GREETING_EXAMPLES.length);
    return GREETING_EXAMPLES[index];
};

const buildSuggestionSummary = (budget, categoryLabel, suggestions, { brandPrefs = [], featurePrefs = [] } = {}) => {
    const lines = suggestions
        .map((p, idx) => `${idx + 1}) ${p.name} — ~${Math.round(p.price).toLocaleString('tr-TR')} ₺`)
        .join('\n');

    const brandPart = brandPrefs.length > 0 ? `🎯 Marka tercihin: ${brandPrefs.map(formatBrandDisplay).join(', ')}.` : '';
    const featurePart = featurePrefs.length > 0
        ? `🔎 Özellik odağın: ${FEATURE_RULES.filter((f) => featurePrefs.includes(f.id)).map((f) => f.label).join(', ')}.`
        : '';

    if (budget) {
        return `Yaklaşık ${budget.toLocaleString('tr-TR')} ₺ bütçene göre 3 ${categoryLabel} seçeneği hazırladım:\n${lines}\n\n${brandPart}${featurePart}\n📌 Bu liste fiyat-performans, güncel fiyat yakınlığı ve tercih sinyallerine göre sıralandı.\nİstersen bir filtre daha ver (ör. depolama, kamera veya yenileme hızı), listeyi daha da netleştireyim.`.trim();
    }

    return `${categoryLabel} kategorisinde öne çıkan 3 ürün:\n${lines}\n\n${brandPart}${featurePart}\n📌 İstersen bütçe aralığı da paylaşırsan çok daha nokta atışı öneri yapabilirim.`.trim();
};

const getCategorySuggestions = async ({ budget, categoryRule, prompt, brandPrefs = [], featurePrefs = [] }) => {
    const data = await getCachedProducts();
    if (!Array.isArray(data) || data.length === 0) {
        return [];
    }

    const normalized = data
        .map((row) => {
            const name = row?.name || row?.model || row?.title;
            const price = parseNumericPrice(row?.price ?? row?.min_price ?? row?.lowest_price ?? row?.current_price);
            const categoryText = `${row?.subcategory || ''} ${row?.category || ''} ${name || ''}`.toLowerCase();

            if (!name || !Number.isFinite(price) || price <= 0) return null;

            const hasKeyword = categoryRule.keywords.some((keyword) => categoryText.includes(keyword));
            const hasExcludedKeyword = categoryRule.excludes.some((keyword) => categoryText.includes(keyword));

            if (!hasKeyword || hasExcludedKeyword) return null;

            const subcategory = slugifyTr(row?.subcategory || row?.category || 'telefon') || 'telefon';
            const slug = slugifyTr(row?.slug || name);
            const identifier = row?.id || slug;

            return {
                id: String(identifier),
                slug,
                productFamilyKey: row?.product_family_key || '',
                subcategory,
                image: row?.image || row?.image1 || '',
                name,
                price,
                row,
                url: `/${subcategory}/en-ucuz-${slug}-fiyati`,
                reason: ''
            };
        })
        .filter(Boolean);

    if (normalized.length === 0) {
        const stopWords = new Set(['ve', 'ile', 'icin', 'için', 'bir', 'bana', 'öner', 'oner', 'tl', 'bin', 'var', 'istiyorum']);
        const promptTokens = String(prompt || '')
            .toLowerCase()
            .replace(/[^a-z0-9ğüşiöç\s]/gi, ' ')
            .split(/\s+/)
            .filter((token) => token && token.length >= 3 && !stopWords.has(token));

        const fallbackRows = data
            .map((row) => {
                const name = row?.name || row?.model || row?.title;
                const price = parseNumericPrice(row?.price ?? row?.min_price ?? row?.lowest_price ?? row?.current_price);
                if (!name || !Number.isFinite(price) || price <= 0) return null;

                const haystack = `${row?.subcategory || ''} ${row?.category || ''} ${name}`.toLowerCase();
                const tokenScore = promptTokens.reduce((acc, token) => acc + (haystack.includes(token) ? 1 : 0), 0);

                const subcategory = slugifyTr(row?.subcategory || row?.category || 'urun') || 'urun';
                const slug = slugifyTr(row?.slug || name);
                const identifier = row?.id || slug;

                return {
                    id: String(identifier),
                    slug,
                    productFamilyKey: row?.product_family_key || '',
                    subcategory,
                    image: row?.image || row?.image1 || '',
                    name,
                    price,
                    tokenScore,
                    row,
                    url: `/${subcategory}/en-ucuz-${slug}-fiyati`,
                    reason: ''
                };
            })
            .filter(Boolean)
            .sort((a, b) => {
                if (b.tokenScore !== a.tokenScore) return b.tokenScore - a.tokenScore;
                if (budget) return Math.abs(a.price - budget) - Math.abs(b.price - budget);
                return a.price - b.price;
            })
            .slice(0, 12);

        const fallbackUnique = pickUniqueSuggestions({
            items: fallbackRows,
            count: 3,
            budget,
            brandPrefs,
            featurePrefs
        });

        return fallbackUnique;
    }

    const ranked = normalized
        .map((product) => {
            const textBlob = getProductTextBlob(product, product.row);
            let score = 0;

            if (budget) {
                const delta = Math.abs(product.price - budget);
                score += Math.max(0, 50 - (delta / Math.max(1000, budget)) * 50);
                if (product.price <= budget) score += 10;
            } else {
                score += 10;
            }

            if (brandPrefs.length > 0) {
                const hasBrand = brandPrefs.some((brand) => textBlob.includes(brand));
                score += hasBrand ? 30 : -8;
            }

            if (featurePrefs.length > 0) {
                const featureScore = FEATURE_RULES
                    .filter((rule) => featurePrefs.includes(rule.id))
                    .reduce((acc, rule) => acc + (rule.keywords.some((keyword) => textBlob.includes(keyword)) ? 10 : 0), 0);
                score += featureScore;

                if (featurePrefs.includes('battery')) {
                    score += getBatteryFeatureScore(product.row, product).score;
                }

                if (featurePrefs.includes('screen')) {
                    score += getScreenFeatureScore(product.row, product).score;
                }

                if (featurePrefs.includes('performance')) {
                    score += getPerformanceFeatureScore(product.row, product).score;
                }
            }

            return { ...product, score };
        })
        .sort((a, b) => b.score - a.score || a.price - b.price);

    let pool = ranked;

    if (budget) {
        const nearLimit = Math.round(budget * 1.12);
        const affordable = ranked.filter((p) => p.price <= nearLimit);
        pool = affordable.length >= 3 ? affordable : ranked;
    }

    return pickUniqueSuggestions({
        items: pool,
        count: 3,
        budget,
        brandPrefs,
        featurePrefs
    });
};

export async function POST(request) {
    try {
        // Rate limiting handled by middleware (Upstash)
        const contentType = request.headers.get('content-type') || '';
        if (!contentType.toLowerCase().includes('application/json')) {
            return NextResponse.json({ error: 'Geçersiz içerik tipi.' }, { status: 415 });
        }

        if (!isAllowedOrigin(request)) {
            return NextResponse.json({ error: 'Geçersiz origin.' }, { status: 403 });
        }

        const body = await request.json();
        const { prompt, type, productName, messages } = body;
        const safePrompt = sanitizeInput(prompt || '');
        const safeMessages = sanitizeMessages(messages);
        const safeProductName = sanitizeInput(productName || '').slice(0, 120);

        // Validasyon: Prompt ve messages yoksa ve type summary/comparison değilse hata
        if (!safePrompt && !safeMessages && type !== 'summary' && type !== 'comparison' && type !== 'assistant') {
            return NextResponse.json({ error: 'Boş mesaj gönderildi.' }, { status: 400 });
        }

        if (safePrompt.length > MAX_PROMPT_CHARS && type === 'assistant') {
            return NextResponse.json({ error: `Mesaj çok uzun. Lütfen ${MAX_PROMPT_CHARS} karakter altında yaz.` }, { status: 400 });
        }

        if (type === 'assistant' && safePrompt) {
            const budget = extractBudget(safePrompt);
            const categoryIntent = detectCategoryIntent(safePrompt);
            const brandPrefs = extractBrandPrefs(safePrompt);
            const featurePrefs = extractFeaturePrefs(safePrompt);
            const historyCategory = getLastUserCategoryIntent(safeMessages, { excludeCurrentPrompt: safePrompt });
            const likelyFollowUp = isLikelyFollowUpPrompt(safePrompt);

            let effectiveCategoryIntent = categoryIntent;

            if (effectiveCategoryIntent?.id === 'kamera' && !isExplicitCameraDeviceIntent(safePrompt)) {
                if (historyCategory && historyCategory.id !== 'kamera') {
                    effectiveCategoryIntent = historyCategory;
                } else if (featurePrefs.includes('camera')) {
                    effectiveCategoryIntent = null;
                }
            }

            if (!effectiveCategoryIntent && featurePrefs.length > 0 && historyCategory && historyCategory.id !== 'kamera') {
                effectiveCategoryIntent = historyCategory;
            }

            if (!effectiveCategoryIntent && historyCategory && (featurePrefs.length > 0 || brandPrefs.length > 0 || !!budget || likelyFollowUp)) {
                effectiveCategoryIntent = historyCategory;
            }

            if (
                effectiveCategoryIntent &&
                historyCategory &&
                effectiveCategoryIntent.id !== historyCategory.id &&
                likelyFollowUp &&
                !hasKeywordMatch(safePrompt, effectiveCategoryIntent.keywords)
            ) {
                effectiveCategoryIntent = historyCategory;
            }

            if (effectiveCategoryIntent) {
                const suggestions = await getCategorySuggestions({
                    budget,
                    categoryRule: effectiveCategoryIntent,
                    prompt: safePrompt,
                    brandPrefs,
                    featurePrefs
                });

                if (suggestions.length > 0) {
                    return NextResponse.json({
                        text: buildSuggestionSummary(budget, effectiveCategoryIntent.label, suggestions, { brandPrefs, featurePrefs }),
                        suggestions
                    });
                }

                const budgetPart = budget ? `${budget.toLocaleString('tr-TR')} ₺ civarında ` : '';
                return NextResponse.json({
                    text: `${budgetPart}${effectiveCategoryIntent.label} bulamadım. İstersen farklı bir bütçe veya marka ile tekrar deneyelim.`
                });
            }

            if (isGreeting(safePrompt)) {
                const example = getRandomGreetingExample();
                return NextResponse.json({
                    text: `Merhaba. KıyasGO alışveriş asistanı olarak yardımcı olabilirim. Bütçe ve ürün kategorisini yazarsanız uygun seçenekleri listeleyebilirim (örnek: ${example}).`
                });
            }
        }

        // --- CACHE CHECK (Summary ve Comparison için) ---
        // Ürün özetleri ve karşılaştırmalar ağırdır, önbellekten çekelim.
        if ((type === 'summary' || type === 'comparison') && safeProductName) {
            const { data: cached } = await supabaseAdmin
                .from('product_summaries')
                .select('content')
            .eq('product_name', safeProductName)
                .single();

            if (cached && cached.content) {
                // Cache HIT! Hızlı dönüş
                console.log(`Cache HIT for ${safeProductName} (Type: ${type})`);
                return NextResponse.json(cached.content);
            }
        }

        let systemContent = `Sen KıyasGO'nun profesyonel alışveriş asistanısın.

**KİŞİLİĞİN:**
    - Profesyonel, net ve saygılı bir dil kullan
    - Gereksiz samimi hitaplardan kaçın
    - Kısa ve anlaşılır cevap ver

**ÜRÜN ÖNERİSİ KURALLARI:**
Kullanıcı bütçe + kategori verirse (örn: "30 bine oyun laptopu"):

1. **Bütçeye uygun 3-5 ürün öner** - gerçek, güncel modeller
2. Her ürün için şu formatı kullan:

**🎯 [Ürün Adı]** - ~XX.XXX ₺
✅ Neden iyi: (1 cümle)
⚠️ Dikkat: (1 cümle)

3. Sonunda kısa bir özet yaz: "Senin için en mantıklısı X çünkü..."

**GİZLİ FORMAT (sadece öneri varsa):**
Mesajın EN SONUNA şunu ekle:
$$SUGGESTIONS$$["Ürün 1", "Ürün 2", "Ürün 3"]

**YASAKLAR:**
- Alışveriş dışı konulara cevap verme (siyaset, din, futbol vb.)
- Kaynak/link ekleme
- Çok uzun açıklamalar
        `;


        let apiMessages = [];

        if (type === 'summary' && safeProductName) {
            systemContent = "Sen deneyimli bir teknoloji editörü ve ürün analiz uzmanısın. Görevin verilen ürün için internetteki/veritabanındaki genel kanıyı, en belirgin artıları ve eksileri analiz edip JSON formatında sunmaktır. Duygusal analiz yap. Çıktın SADECE ve SADECE şu JSON şemasında olmalı, markdown yok, sadece raw JSON: { \"sentiment\": \"Ürün hakkında 1-2 cümlelik özet kanı (Türkçe)\", \"pros\": [\"artı 1\", \"artı 2\", \"artı 3\"], \"cons\": [\"eksi 1\", \"eksi 2\", \"eksi 3\"] }. Objektif ol.";
            apiMessages = [
                { role: "system", content: systemContent },
                { role: "user", content: `Analiz edilecek ürün: ${safeProductName}` }
            ];
        } else if (type === 'comparison') {
            // Comparison için prompt zaten client'dan detaylı geliyor
            systemContent = "Sen uzman bir ürün karşılaştırma asistanısın. Sadece JSON formatında çıktı verirsin.";
            apiMessages = [
                { role: "system", content: systemContent },
                { role: "user", content: safePrompt }
            ];
        } else {
            // Normal Chat
            apiMessages = safeMessages || [
                { role: "system", content: systemContent },
                { role: "user", content: safePrompt }
            ];
            // Ensure system prompt is first if passed messages doesn't have it (or we force it)
            if (apiMessages.length > 0 && apiMessages[0].role !== 'system') {
                apiMessages.unshift({ role: "system", content: systemContent });
            }
        }

        const text = await generateAssistantText({
            messages: apiMessages,
            temperature: (type === 'summary' || type === 'comparison') ? 0.3 : 0.7,
            jsonMode: (type === 'summary' || type === 'comparison')
        });

        if (!text) {
            return NextResponse.json({ result: "⚠️ Model yanıtı boş döndü. LLM ayarlarını kontrol edin." });
        }

        // --- CACHE SAVE (Summary ve Comparison için) ---
        if ((type === 'summary' || type === 'comparison') && safeProductName) {
            try {
                // OpenAI structured sends JSON string, we parse it to store as JSONB
                const contentJson = parseMaybeJson(text) || {};

                // Construct standard response object to cache
                const responseObj = { result: text, text: text, ...contentJson };

                const { error: insertError } = await supabaseAdmin
                    .from('product_summaries')
                    .insert({
                        product_name: safeProductName,
                        content: responseObj
                    });

                if (insertError) {
                    console.error("Cache Insert Error:", insertError);
                } else {
                    console.log(`Cache SAVED for ${safeProductName}`);
                }

                return NextResponse.json(responseObj);

            } catch (e) {
                console.error("Cache save parse failed:", e);
                // Return anyway even if cache fails
                return NextResponse.json({ result: text, text: text });
            }
        }

        return NextResponse.json({ result: text, text: text });

    } catch (error) {
        console.error("API Hatası:", error);
        return NextResponse.json({ result: "Sunucu hatası veya API erişim sorunu oluştu." });
    }
}
