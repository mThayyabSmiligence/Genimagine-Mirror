const cron = require('node-cron');

cron.schedule('*/30 * * * * *', async () => {
    console.log("hi the corn job is running")
});