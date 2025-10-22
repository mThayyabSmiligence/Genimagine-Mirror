// all worker files should end with "Worker.js"
require("dotenv").config({ path: require("path").resolve(__dirname, "../config.env") });
const IORedis = require("ioredis");
const { sequelize } = require("../models");
const fs = require("fs");
const path = require("path");

// Connect to DB
sequelize.authenticate()
  .then(() => console.log("✅ Sequelize connected"))
  .catch(err => console.error("❌ Sequelize error: ", err));

sequelize.sync({ alter: false })  
  .then(() => console.log("✅ Sequelize models are synced"))
  .catch(err => console.error("❌ Sequelize sync error: ", err));

// Redis connection
const redis_url = process.env.REDIS_URL;
console.log(redis_url,"give")

const connection = new IORedis(redis_url,{
    tls:{},
    maxRetriesPerRequest: null,
});

// Dynamically load all workers
const workerFiles = fs.readdirSync(__dirname).filter(file =>
  file.endsWith("Worker.js") && file !== "index.js"
);

for (const file of workerFiles) {
  const registerWorker = require(path.join(__dirname, file));
  if (typeof registerWorker === "function") {
    registerWorker(connection);
    console.log(`✅ Worker loaded: ${file}`);
  } else {
    console.error(`⚠️ ${file} does not export a function`);
  }
}
