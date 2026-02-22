const http = require('http');

async function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

(async () => {
  const url = process.env.URL || 'http://localhost:3000/api/typo-test';
  console.log('Fetching', url);
  try {
    const body = await fetchJson(url);
    if (!body.ok) {
      console.error('API returned not ok', body);
      process.exit(2);
    }

    let failures = 0;
    for (const r of body.results) {
      if (!r.changed) {
        console.warn('WARN: query not normalized', r.query);
      }
      // ensure no short-token suggestions present
      if (r.corrections) {
        for (const [k, vals] of Object.entries(r.corrections)) {
          if (k && k.length < 4) {
            console.error('FAIL: short token suggestion present for', k, '->', vals);
            failures++;
          }
        }
      }
    }

    if (failures > 0) {
      console.error('Smoke test failed with', failures, 'failures');
      process.exit(1);
    }

    console.log('Smoke test passed. Sample results:');
    console.log(JSON.stringify(body.results, null, 2));
    process.exit(0);
  } catch (e) {
    console.error('Error fetching API:', e.message || e);
    console.error('Make sure the app is running (npm run start) and try again.');
    process.exit(3);
  }
})();
