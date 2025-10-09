const { Worker } = require("bullmq");
const IORedis = require("ioredis");

// Connect to Redis (fix for maxRetriesPerRequest)
const connection = new IORedis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null, // important for BullMQ
});

// Worker
const worker = new Worker(
  "numberQueue",
  async job => {
    const { number } = job.data;

    for(let i = 0; i < 10; i++) {
      console.log(`Processing number: ${i}`);
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
    

  },
  { connection , concurrency: 1     }
);

worker.on("completed", job => {
  console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed: ${err.message}`);
});
