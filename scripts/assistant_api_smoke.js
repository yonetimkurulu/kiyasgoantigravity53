const http = require('http');

function canonicalSuggestionKey(item) {
  const raw = String(item?.slug || item?.name || '').toLowerCase();
  const tokens = raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/[-\s]+/)
    .filter(Boolean);

  const drop = new Set([
    'gb', 'tb', 'mb', 'ram',
    'siyah', 'black', 'beyaz', 'white', 'mavi', 'blue', 'yesil', 'green', 'kirmizi', 'red',
    'mor', 'purple', 'pembe', 'pink', 'gri', 'gray', 'grey', 'silver', 'gold', 'altin', 'altn',
    'midnight', 'starlight', 'graphite', 'uzay', 'grisi', 'titanyum', 'titanium',
    '5g', '4g', 'lte', 'nfc', 'dualsim', 'dual', 'sim', 'tek', 'cift', 'ciftsim'
  ]);

  const kept = [];
  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    const next = tokens[i + 1];

    if (/^\d+$/.test(token) && (next === 'gb' || next === 'tb' || next === 'mb' || next === 'ram')) {
      i += 1;
      continue;
    }

    if (drop.has(token)) continue;
    kept.push(token);
  }

  return kept.join(' ').trim();
}

function assertPhoneCategorySuggestions(suggestions, label) {
  if (!Array.isArray(suggestions) || suggestions.length === 0) {
    throw new Error(`No suggestions for ${label}.`);
  }

  const nonPhoneSuggestion = suggestions.find((item) => {
    const url = String(item?.url || '').toLowerCase();
    return !url.includes('/telefon') && !url.includes('/cep-telefonu/');
  });

  if (nonPhoneSuggestion) {
    throw new Error(`Category drift (${label}): ${nonPhoneSuggestion.name || nonPhoneSuggestion.url}`);
  }
}

function assertLaptopCategorySuggestions(suggestions, label) {
  if (!Array.isArray(suggestions) || suggestions.length === 0) {
    throw new Error(`No suggestions for ${label}.`);
  }

  const nonLaptopSuggestion = suggestions.find((item) => {
    const url = String(item?.url || '').toLowerCase();
    return !url.includes('/laptop') && !url.includes('/notebook') && !url.includes('/bilgisayar');
  });

  if (nonLaptopSuggestion) {
    throw new Error(`Category drift (${label}): ${nonLaptopSuggestion.name || nonLaptopSuggestion.url}`);
  }
}

function postJson(url, payload) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const data = JSON.stringify(payload);

    const options = {
      hostname: parsed.hostname,
      port: parsed.port || 80,
      path: parsed.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode || 0, json: JSON.parse(body || '{}') });
        } catch (error) {
          reject(new Error(`Invalid JSON response: ${body?.slice(0, 200)}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

(async () => {
  const base = process.env.URL || 'http://localhost:3000';
  const endpoint = `${base}/api/openai`;

  try {
    console.log('Testing endpoint:', endpoint);

    const budgetPrompt = "30 bin tl var bana bir telefon öner";
    const budgetRes = await postJson(endpoint, { type: 'assistant', prompt: budgetPrompt });
    if (budgetRes.status < 200 || budgetRes.status >= 300) {
      throw new Error(`Budget request failed with status ${budgetRes.status}`);
    }

    const suggestions = Array.isArray(budgetRes.json?.suggestions) ? budgetRes.json.suggestions : [];
    if (suggestions.length === 0) {
      throw new Error('No suggestions returned for budget phone prompt.');
    }

    const badSuggestion = suggestions.find((s) => !(s && s.name && s.url));
    if (badSuggestion) {
      throw new Error('Invalid suggestion item shape. Expected name and url fields.');
    }

    const greetingRes = await postJson(endpoint, { type: 'assistant', prompt: 'naber' });
    if (greetingRes.status < 200 || greetingRes.status >= 300) {
      throw new Error(`Greeting request failed with status ${greetingRes.status}`);
    }

    const greetingText = String(greetingRes.json?.text || '').toLowerCase();
    if (!greetingText.includes('alışveriş') && !greetingText.includes('yardımcı')) {
      throw new Error('Greeting response is not shopping-help oriented.');
    }

    const laptopRes = await postJson(endpoint, { type: 'assistant', prompt: '40 bin tl laptop öner' });
    if (laptopRes.status < 200 || laptopRes.status >= 300) {
      throw new Error(`Laptop request failed with status ${laptopRes.status}`);
    }

    const laptopSuggestions = Array.isArray(laptopRes.json?.suggestions) ? laptopRes.json.suggestions : [];
    if (laptopSuggestions.length === 0) {
      throw new Error('No suggestions returned for laptop prompt.');
    }

    const watchRes = await postJson(endpoint, { type: 'assistant', prompt: '10 bin tl akıllı saat öner' });
    if (watchRes.status < 200 || watchRes.status >= 300) {
      throw new Error(`Watch request failed with status ${watchRes.status}`);
    }

    const watchSuggestions = Array.isArray(watchRes.json?.suggestions) ? watchRes.json.suggestions : [];
    if (watchSuggestions.length === 0) {
      throw new Error('No suggestions returned for smartwatch prompt.');
    }

    const consoleRes = await postJson(endpoint, { type: 'assistant', prompt: '20 bin tl oyun konsolu öner' });
    if (consoleRes.status < 200 || consoleRes.status >= 300) {
      throw new Error(`Console request failed with status ${consoleRes.status}`);
    }

    const consoleSuggestions = Array.isArray(consoleRes.json?.suggestions) ? consoleRes.json.suggestions : [];
    if (consoleSuggestions.length === 0) {
      throw new Error('No suggestions returned for game console prompt.');
    }

    const brandedRes = await postJson(endpoint, { type: 'assistant', prompt: '30 bin tl samsung telefon kamera öner' });
    if (brandedRes.status < 200 || brandedRes.status >= 300) {
      throw new Error(`Brand+feature request failed with status ${brandedRes.status}`);
    }

    const brandedSuggestions = Array.isArray(brandedRes.json?.suggestions) ? brandedRes.json.suggestions : [];
    if (brandedSuggestions.length === 0) {
      throw new Error('No suggestions returned for brand+feature prompt.');
    }

    const seen = new Set();
    for (const suggestion of brandedSuggestions) {
      const key = canonicalSuggestionKey(suggestion);
      if (!key) continue;
      if (seen.has(key)) {
        throw new Error(`Duplicate model variant detected in branded suggestions: ${suggestion.name || suggestion.slug}`);
      }
      seen.add(key);
    }

    const brandedText = String(brandedRes.json?.text || '').toLowerCase();
    if (!brandedText.includes('marka') && !brandedText.includes('özellik')) {
      throw new Error('Brand+feature response text does not mention preference-aware guidance.');
    }

    const batteryRes = await postJson(endpoint, { type: 'assistant', prompt: '25 bin tl bataryası iyi telefon öner' });
    if (batteryRes.status < 200 || batteryRes.status >= 300) {
      throw new Error(`Battery request failed with status ${batteryRes.status}`);
    }

    const batterySuggestions = Array.isArray(batteryRes.json?.suggestions) ? batteryRes.json.suggestions : [];
    assertPhoneCategorySuggestions(batterySuggestions, 'battery-priority');

    const batteryText = String(batteryRes.json?.text || '').toLowerCase();
    if (!batteryText.includes('batarya')) {
      throw new Error('Battery-priority response text does not mention battery focus.');
    }

    const screenRes = await postJson(endpoint, { type: 'assistant', prompt: '25 bin tl ekranı iyi telefon öner' });
    if (screenRes.status < 200 || screenRes.status >= 300) {
      throw new Error(`Screen request failed with status ${screenRes.status}`);
    }

    const screenSuggestions = Array.isArray(screenRes.json?.suggestions) ? screenRes.json.suggestions : [];
    assertPhoneCategorySuggestions(screenSuggestions, 'screen-priority');

    const gamingLaptopRes = await postJson(endpoint, { type: 'assistant', prompt: '50 bin tl ekran kartı güçlü laptop öner' });
    if (gamingLaptopRes.status < 200 || gamingLaptopRes.status >= 300) {
      throw new Error(`Gaming laptop request failed with status ${gamingLaptopRes.status}`);
    }

    const gamingLaptopSuggestions = Array.isArray(gamingLaptopRes.json?.suggestions) ? gamingLaptopRes.json.suggestions : [];
    assertLaptopCategorySuggestions(gamingLaptopSuggestions, 'gpu-laptop-priority');

    const followUpCases = [
      {
        label: 'camera-followup',
        prompt: 'kamerası önemli benim için',
      },
      {
        label: 'battery-followup',
        prompt: 'bataryası daha iyi olsun',
      },
      {
        label: 'performance-followup',
        prompt: 'oyunda daha iyi performans istiyorum',
      },
      {
        label: 'brand-followup',
        prompt: 'samsung olsun',
      },
    ];

    for (const testCase of followUpCases) {
      const followUpRes = await postJson(endpoint, {
        type: 'assistant',
        prompt: testCase.prompt,
        messages: [
          { role: 'user', content: '25 bine telefon önerisi yap xiaomi' },
          { role: 'assistant', content: 'Tabii, bütçene uygun telefonları listeliyorum.' },
          { role: 'user', content: testCase.prompt }
        ]
      });

      if (followUpRes.status < 200 || followUpRes.status >= 300) {
        throw new Error(`Follow-up request failed (${testCase.label}) with status ${followUpRes.status}`);
      }

      const followUpSuggestions = Array.isArray(followUpRes.json?.suggestions) ? followUpRes.json.suggestions : [];
      assertPhoneCategorySuggestions(followUpSuggestions, testCase.label);
    }

    console.log('Assistant smoke test passed.');
    console.log(`Suggestion count: ${suggestions.length}`);
    console.log(`Top suggestion: ${suggestions[0].name} -> ${suggestions[0].url}`);
    process.exit(0);
  } catch (error) {
    console.error('Assistant smoke test failed:', error.message || error);
    console.error('Make sure the app is running with `npm run start` and try again.');
    process.exit(1);
  }
})();
