const https = require('https');
const fs = require('fs');
const path = require('path');

// Read .env.local manually
try {
    const envPath = path.join(__dirname, '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/OPENAI_API_KEY=(.*)/);

    if (!match) {
        console.error("❌ OPENAI_API_KEY not found in .env.local");
        process.exit(1);
    }

    const apiKey = match[1].trim();
    console.log(`Checking Key: ${apiKey.substring(0, 10)}...`);

    const data = JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: "Hello" }]
    });

    const options = {
        hostname: 'api.openai.com',
        port: 443,
        path: '/v1/chat/completions',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'Content-Length': data.length
        }
    };

    const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
            if (res.statusCode === 200) {
                console.log("✅ Success! API Key is valid.");
            } else {
                console.error(`❌ Failed! Status: ${res.statusCode}`);
                console.error("Response:", body);
            }
        });
    });

    req.on('error', (error) => {
        console.error("❌ Network Error:", error);
    });

    req.write(data);
    req.end();

} catch (err) {
    console.error("Error reading file:", err);
}
