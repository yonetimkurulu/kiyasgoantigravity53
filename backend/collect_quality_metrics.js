const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const { randomUUID } = require('crypto');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const flattenValues = (value) => {
  if (value == null) return [];
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return [String(value)];
  if (Array.isArray(value)) return value.flatMap((entry) => flattenValues(entry));
  if (typeof value === 'object') {
    return Object.entries(value).flatMap(([key, val]) => [String(key), ...flattenValues(val)]);
  }
  return [];
};

const toTextBlob = (row) => {
  return [
    row?.name,
    row?.slug,
    row?.category,
    row?.subcategory,
    row?.desc,
    row?.description,
    ...flattenValues(row?.specs),
    ...flattenValues(row?.gsmarena_data)
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
};

const isLaptopLike = (row = {}) => {
  const text = `${row?.category || ''} ${row?.subcategory || ''} ${row?.name || ''}`.toLowerCase();
  return /laptop|notebook|dizustu|dizüstü|bilgisayar|gaming/.test(text);
};

const isPhoneLike = (row = {}) => {
  const text = `${row?.category || ''} ${row?.subcategory || ''} ${row?.name || ''}`.toLowerCase();
  return /telefon|cep|smartphone|iphone|android/.test(text);
};

const parseBatteryMah = (text) => {
  const matches = [...String(text).matchAll(/(\d{3,5})\s?mah/g)].map((m) => Number.parseInt(m[1], 10));
  const valid = matches.filter((v) => Number.isFinite(v) && v >= 2500 && v <= 10000);
  return valid.length > 0 ? Math.max(...valid) : null;
};

const parseCameraMp = (text) => {
  const matches = [...String(text).matchAll(/(\d{2,3})\s?mp/g)].map((m) => Number.parseInt(m[1], 10));
  const valid = matches.filter((v) => Number.isFinite(v) && v >= 8 && v <= 300);
  return valid.length > 0 ? Math.max(...valid) : null;
};

const parseScreenRefreshHz = (text) => {
  const matches = [...String(text).matchAll(/(\d{2,3})\s?hz/g)].map((m) => Number.parseInt(m[1], 10));
  const valid = matches.filter((v) => Number.isFinite(v) && v >= 50 && v <= 360);
  return valid.length > 0 ? Math.max(...valid) : null;
};

const parseScreenSize = (text) => {
  const match = String(text).match(/(\d{1,2}(?:[.,]\d{1,2})?)\s?(inch|inç|\")/i);
  if (!match) return null;
  const value = Number.parseFloat(String(match[1]).replace(',', '.'));
  if (!Number.isFinite(value) || value < 4 || value > 25) return null;
  return Number(value.toFixed(2));
};

const parseResolutionTier = (text) => {
  const source = String(text);
  if (/\b(4k|uhd|3840\s*x\s*2160)\b/i.test(source)) return 5;
  if (/\b(qhd|2k|2560\s*x\s*1440|wqhd)\b/i.test(source)) return 4;
  if (/\b(fhd|1080p|1920\s*x\s*1080)\b/i.test(source)) return 3;
  if (/\b(hd|720p|1366\s*x\s*768)\b/i.test(source)) return 2;
  return null;
};

const parseGpuModel = (text) => {
  const match = String(text).match(/\b(rtx\s?\d{3,4}|gtx\s?\d{3,4}|rx\s?\d{3,4}m?|mx\s?\d{3,4}|arc\s?[a-z0-9\-+ ]{1,12})\b/i);
  return match ? match[1].replace(/\s+/g, ' ').trim().toUpperCase() : null;
};

const parseGpuTier = (gpuModel = '') => {
  const model = gpuModel.toUpperCase();
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

const parseGpuTdp = (text) => {
  const match = String(text).match(/\b(\d{2,3})\s?(w|watt|tdp|tgp)\b/i);
  if (!match) return null;
  const value = Number.parseInt(match[1], 10);
  if (!Number.isFinite(value) || value < 10 || value > 300) return null;
  return value;
};

const computeQualityScore = ({ batteryMah, cameraMainMp, screenRefreshHz, screenResolutionTier, gpuTier, gpuTdpWatt, profile = 'generic' }) => {
  let score = 0;

  if (profile === 'laptop') {
    if (screenRefreshHz) score += Math.min(14, Math.max(2, screenRefreshHz / 14));
    if (screenResolutionTier) score += screenResolutionTier * 2;
    if (gpuTier) score += Math.min(28, gpuTier / 1.4);
    if (gpuTdpWatt) score += Math.min(12, Math.max(1, gpuTdpWatt / 10));
    if (batteryMah) score += Math.min(8, Math.max(1, (batteryMah - 3500) / 200));
  } else if (profile === 'phone') {
    if (batteryMah) score += Math.min(22, Math.max(4, (batteryMah - 3000) / 140));
    if (cameraMainMp) score += Math.min(17, Math.max(2, cameraMainMp / 11));
    if (screenRefreshHz) score += Math.min(12, Math.max(2, screenRefreshHz / 15));
    if (screenResolutionTier) score += screenResolutionTier * 2;
  } else {
    if (batteryMah) score += Math.min(20, Math.max(4, (batteryMah - 3000) / 150));
    if (cameraMainMp) score += Math.min(15, Math.max(2, cameraMainMp / 12));
    if (screenRefreshHz) score += Math.min(12, Math.max(2, screenRefreshHz / 15));
    if (screenResolutionTier) score += screenResolutionTier * 2;
    if (gpuTier) score += Math.min(20, gpuTier / 1.6);
    if (gpuTdpWatt) score += Math.min(8, Math.max(1, gpuTdpWatt / 14));
  }

  return Number(score.toFixed(2));
};

const collectMetrics = (row) => {
  const text = toTextBlob(row);
  const laptopLike = isLaptopLike(row);
  const phoneLike = isPhoneLike(row);

  const batteryMah = parseBatteryMah(text);
  const cameraMainMp = parseCameraMp(text);
  const screenRefreshHz = parseScreenRefreshHz(text);
  const screenSizeInch = parseScreenSize(text);
  const screenResolutionTier = parseResolutionTier(text);
  const gpuModel = laptopLike ? parseGpuModel(text) : null;
  const gpuTier = laptopLike ? parseGpuTier(gpuModel || '') : null;
  const gpuTdpWatt = laptopLike ? parseGpuTdp(text) : null;

  const profile = laptopLike ? 'laptop' : (phoneLike ? 'phone' : 'generic');

  const qualityScore = computeQualityScore({
    batteryMah,
    cameraMainMp,
    screenRefreshHz,
    screenResolutionTier,
    gpuTier,
    gpuTdpWatt,
    profile
  });

  const confidenceSignals = [batteryMah, cameraMainMp, screenRefreshHz, screenResolutionTier, gpuTier, gpuTdpWatt]
    .filter((value) => value != null)
    .length;

  const confidence = Number(Math.min(1, confidenceSignals / 6).toFixed(2));

  return {
    batteryMah,
    cameraMainMp,
    screenRefreshHz,
    screenSizeInch,
    screenResolutionTier,
    gpuModel,
    gpuTier,
    gpuTdpWatt,
    qualityScore,
    confidence,
    metricsPayload: {
      extracted_from: ['name', 'desc', 'description', 'specs', 'gsmarena_data'],
      confidence_signals: confidenceSignals,
      profile
    }
  };
};

async function fetchAllProducts() {
  const all = [];
  const pageSize = 500;
  let from = 0;

  while (true) {
    const to = from + pageSize - 1;
    const { data, error } = await supabase
      .from('products')
      .select('id, slug, name, category, subcategory, specs, gsmarena_data, desc, description')
      .range(from, to);

    if (error) throw new Error(`Products fetch error: ${error.message}`);
    if (!Array.isArray(data) || data.length === 0) break;

    all.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }

  return all;
}

async function main() {
  const runId = randomUUID();
  console.log(`Collecting quality metrics (run: ${runId})...`);

  const products = await fetchAllProducts();
  console.log(`Products fetched: ${products.length}`);

  let upserted = 0;
  let observed = 0;

  for (const row of products) {
    if (!row?.slug || !row?.name) continue;

    const metrics = collectMetrics(row);

    const payload = {
      product_slug: row.slug,
      product_id: String(row.id || ''),
      product_name: row.name,
      category: row.category || null,
      subcategory: row.subcategory || null,
      battery_mah: metrics.batteryMah,
      camera_main_mp: metrics.cameraMainMp,
      screen_size_inch: metrics.screenSizeInch,
      screen_refresh_hz: metrics.screenRefreshHz,
      screen_resolution_tier: metrics.screenResolutionTier,
      gpu_model: metrics.gpuModel,
      gpu_tier: metrics.gpuTier,
      gpu_tdp_watt: metrics.gpuTdpWatt,
      quality_score: metrics.qualityScore,
      confidence: metrics.confidence,
      metrics_payload: metrics.metricsPayload,
      updated_at: new Date().toISOString()
    };

    const { error: upsertError } = await supabase
      .from('product_quality_metrics')
      .upsert(payload, { onConflict: 'product_slug' });

    if (upsertError) {
      console.error(`Upsert error (${row.slug}):`, upsertError.message);
      continue;
    }

    upserted += 1;

    const observations = [];
    const pushObs = (key, value, numeric = null) => {
      if (value == null || value === '') return;
      observations.push({
        run_id: runId,
        product_slug: row.slug,
        metric_key: key,
        metric_value: String(value),
        metric_numeric: numeric,
        source_field: 'mixed_fields',
        source_name: 'internal_parse'
      });
    };

    pushObs('battery_mah', metrics.batteryMah, metrics.batteryMah);
    pushObs('camera_main_mp', metrics.cameraMainMp, metrics.cameraMainMp);
    pushObs('screen_refresh_hz', metrics.screenRefreshHz, metrics.screenRefreshHz);
    pushObs('screen_size_inch', metrics.screenSizeInch, metrics.screenSizeInch);
    pushObs('screen_resolution_tier', metrics.screenResolutionTier, metrics.screenResolutionTier);
    pushObs('gpu_model', metrics.gpuModel, null);
    pushObs('gpu_tier', metrics.gpuTier, metrics.gpuTier);
    pushObs('gpu_tdp_watt', metrics.gpuTdpWatt, metrics.gpuTdpWatt);

    if (observations.length > 0) {
      const { error: obsError } = await supabase
        .from('product_metric_observations')
        .insert(observations);
      if (obsError) {
        console.error(`Observation insert error (${row.slug}):`, obsError.message);
      } else {
        observed += observations.length;
      }
    }
  }

  console.log(`Metrics upserted: ${upserted}`);
  console.log(`Observations inserted: ${observed}`);
  console.log(`Done. Run ID: ${runId}`);
}

main().catch((error) => {
  console.error('collect_quality_metrics failed:', error.message || error);
  process.exit(1);
});
