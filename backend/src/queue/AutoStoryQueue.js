const { Queue } = require('bullmq');
const IORedis = require('ioredis');
const dotenv = require('dotenv');
const path = require('path')
dotenv.config({path: path.join(__dirname,"config.env")})
const redis_url = process.env.REDIS_URL;

// const connection = new IORedis(redis_url,{
//     tls:{},
//     maxRetriesPerRequest: null,
// });

const connection = new IORedis({
    host:"127.0.0.1",
    port: 6379,
    maxRetriesPerRequest: null,
});

const autoStoryQueue = new Queue("autoStoryQueue", { connection });

module.exports = autoStoryQueue;