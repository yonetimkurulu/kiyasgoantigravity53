const cron = require('node-cron');
const { runAll } = require('./index');

console.log("⏳ Cron Bot Started. Schedule: Every 1 Hour");

// Schedule task to run every hour (0 * * * *)
cron.schedule('0 * * * *', async () => {
    console.log(`\n⏰ Cron Job Triggered at ${new Date().toLocaleString()}`);
    await runAll();
});

// Run immediately on start to verify
runAll();
