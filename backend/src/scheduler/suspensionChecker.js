const cron = require('node-cron');
const { checkSuspensionExpiryService } = require('../service/UserService');

// Run every 5 minutes
cron.schedule('* * * * *', async () => {

    await checkSuspensionExpiryService();
}); 