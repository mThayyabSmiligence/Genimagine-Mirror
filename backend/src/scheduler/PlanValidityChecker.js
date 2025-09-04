const cron = require('node-cron');
const { expireOldPlans } = require('../controller/RayzorPayController');


    cron.schedule('* * * * *', async () => {
     console.log(`[CRON JOBS]Running plan expiry check`);
    expireOldPlans();
});