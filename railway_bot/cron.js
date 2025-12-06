const cron = require('node-cron');
const http = require('http');
const { runAll } = require('./index');

// --- RAILWAY KEEP-ALIVE HTTP SERVER ---
const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('KiyasGO Bot is Running 🚀');
});

server.listen(PORT, () => {
    console.log(`🌐 Server listening on port ${PORT}`);
});

console.log("⏳ Cron Bot Started. Schedule: Every 1 Hour");

// Schedule task to run every hour (0 * * * *)
cron.schedule('0 * * * *', async () => {
    console.log(`\n⏰ Cron Job Triggered at ${new Date().toLocaleString()}`);
    await runAll();
});

// Run immediately on start
runAll();
