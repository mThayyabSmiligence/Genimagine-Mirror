const cron = require('node-cron');
const { expireOldPlans } = require('../controller/RayzorPayController');


    cron.schedule('* * * * *', async () => {
    expireOldPlans();
});