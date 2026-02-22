// Lightweight typo normalization + suggestion util
import typoMap from '@/app/data/typo_map.json';

// Build reverse map of canonical -> variants (optional)
const CANONICALS = {};
for (const [wrong, right] of Object.entries(typoMap)) {
  CANONICALS[right] = CANONICALS[right] || [];
  CANONICALS[right].push(wrong);
}

function levenshtein(a, b) {
  if (!a || !b) return (a || b) ? Math.max(a.length, b.length) : 0;
  const m = a.length, n = b.length;
  const d = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) d[i][0] = i;
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
    }
  }
  return d[m][n];
}

// Normalize a single token using exact map or return null
export function getCanonical(token) {
  if (!token) return null;
  const t = token.toLowerCase();
  if (typoMap[t]) return typoMap[t];
  return null;
}

// Replace tokens in a query using map; returns normalized query and a boolean whether any change occurred
export function normalizeQuery(query) {
  if (!query) return { normalized: '', changed: false };
  const tokens = query.split(/(\s+)/); // keep spaces
  let changed = false;
  const normalized = tokens.map(tok => {
    // preserve whitespace tokens
    if (/^\s+$/.test(tok)) return tok;
    const c = getCanonical(tok.replace(/[^\wÇÖÜŞİĞçöüşığ-]/gi, ''));
    if (c) { changed = true; return c; }
    return tok;
  }).join('');
  return { normalized, changed };
}

// Suggest corrections for a token using fuzzy match (maxDistance default 2)
export function suggestForToken(token, maxDistance = 2) {
  if (!token) return [];
  const t = token.toLowerCase();
  // ignore very short tokens for fuzzy suggestions (too noisy)
  const MIN_FUZZY_LENGTH = 4;
  // first check exact map
  if (typoMap[t]) return [typoMap[t]];
  if (t.length < MIN_FUZZY_LENGTH) return [];
  // otherwise compute distances to known wrong-forms and to canonical names
  const candidates = new Map();
  for (const key of Object.keys(typoMap)) {
    const d = levenshtein(t, key);
    if (d <= maxDistance) candidates.set(typoMap[key], Math.min(candidates.get(typoMap[key]) ?? Infinity, d));
  }
  // also try canonical tokens themselves
  for (const canonical of Object.keys(CANONICALS)) {
    const d = levenshtein(t, canonical);
    if (d <= maxDistance) candidates.set(canonical, Math.min(candidates.get(canonical) ?? Infinity, d));
  }
  // sort by distance
  return Array.from(candidates.entries()).sort((a,b) => a[1]-b[1]).map(x=>x[0]);
}

// Suggest corrections for full query: returns map token->suggestions
export function suggestCorrections(query, maxDistance = 2) {
  if (!query) return {};
  const parts = query.split(/\s+/);
  const result = {};
  for (const p of parts) {
    const cleaned = p.replace(/[^\wÇÖÜŞİĞçöüşığ-]/gi, '');
    if (!cleaned || cleaned.length < 4) continue; // skip very short tokens
    const suggestions = suggestForToken(cleaned, maxDistance);
    if (suggestions && suggestions.length > 0) result[p] = suggestions;
  }
  return result;
}

export default {
  getCanonical,
  normalizeQuery,
  suggestForToken,
  suggestCorrections,
};
