const cron = require('node-cron');
const { checkSuspensionExpiryService } = require('../service/UserService');

// Run every 5 minutes
cron.schedule('* * * * *', async () => {
    console.log('[CRON] Checking for expired suspensions...');
    await checkSuspensionExpiryService();
}); 