const { Queue } = require("bullmq");
const IORedis = require("ioredis");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.join(__dirname, "../config.env") });


const connection = new IORedis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null,
});

// export helper to create queues
const createQueue = (name) => new Queue(name, { connection });

module.exports = { createQueue, connection };
