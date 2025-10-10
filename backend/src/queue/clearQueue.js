const { Queue } = require('bullmq');
const IORedis = require('ioredis');

// const connection = new IORedis({
//   host: '127.0.0.1',
//   port: 6379,
// });

// const queue = new Queue('autoStoryQueue', { connection });

// (async () => {
//   try {
//     console.log('🧹 Cleaning queue...');
//     await queue.clean(0, 0, 'completed');
//     await queue.clean(0, 0, 'wait');
//     await queue.clean(0, 0, 'active');
//     await queue.clean(0, 0, 'delayed');
//     await queue.clean(0, 0, 'failed');
//     await queue.drain(true); // removes waiting and delayed jobs

//     console.log('✅ autoStoryQueue completely cleared');
//   } catch (err) {
//     console.error('Error clearing queue:', err);
//   } finally {
//     process.exit(0);
//   }
// })();
