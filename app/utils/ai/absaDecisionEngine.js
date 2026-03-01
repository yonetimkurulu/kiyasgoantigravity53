const normalizeDecisionText = (text = '') => String(text)
  .toLowerCase()
  .replace(/ı/g, 'i')
  .replace(/ğ/g, 'g')
  .replace(/ü/g, 'u')
  .replace(/ş/g, 's')
  .replace(/ö/g, 'o')
  .replace(/ç/g, 'c')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9\s]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const extractAspectPriorities = ({ text = '', aspectRules = [] }) => {
  const normalized = normalizeDecisionText(text);

  return aspectRules
    .map((rule) => {
      const matches = (rule.keywords || [])
        .map((keyword) => normalizeDecisionText(keyword))
        .filter(Boolean)
        .map((keyword) => normalized.indexOf(keyword))
        .filter((index) => index >= 0);

      if (matches.length === 0) return null;

      const firstIndex = Math.min(...matches);
      const confidence = Math.min(1, 0.45 + (matches.length * 0.15));
      return {
        id: rule.id,
        firstIndex,
        confidence: Number(confidence.toFixed(2))
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.firstIndex - b.firstIndex);
};

const getAspectPriorityMultiplier = (aspectId, orderedAspectIds = []) => {
  const index = orderedAspectIds.indexOf(aspectId);
  if (index === 0) return 1.9;
  if (index === 1) return 1.45;
  if (index === 2) return 1.2;
  return 1;
};

const buildDecisionTrace = ({
  prompt = '',
  categoryIntent = null,
  budget = null,
  historyBudget = null,
  brandPrefs = [],
  orderedAspects = []
}) => {
  const effectiveBudget = budget || historyBudget || null;
  const primaryAspect = orderedAspects[0]?.id || null;

  return {
    version: 'absa-lite-v1',
    prompt,
    effectiveCategory: categoryIntent?.id || null,
    effectiveBudget,
    primaryAspect,
    orderedAspects: orderedAspects.map((item) => ({
      id: item.id,
      confidence: item.confidence
    })),
    brandPrefs,
    createdAt: new Date().toISOString()
  };
};

export {
  normalizeDecisionText,
  extractAspectPriorities,
  getAspectPriorityMultiplier,
  buildDecisionTrace
};
