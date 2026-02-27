const http = require('http');

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

    const brandedText = String(brandedRes.json?.text || '').toLowerCase();
    if (!brandedText.includes('marka') && !brandedText.includes('özellik')) {
      throw new Error('Brand+feature response text does not mention preference-aware guidance.');
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
