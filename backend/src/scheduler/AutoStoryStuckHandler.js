const cron = require('node-cron');
const { stuckHandler } = require('../service/AutoStoryService');

cron.schedule('* * * * *', async () => {
    await stuckHandler();
});