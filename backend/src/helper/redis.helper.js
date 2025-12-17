const IORedis = require("ioredis");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.join(__dirname, "../config.env") });

const redis_url = process.env.REDIS_URL;

const connection = new IORedis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null,
});

async function saveToRedis(key, data){
    try{
        if(!key) throw new Error("Redis key is required");
        if(data === undefined ||  data === null) 
            throw new Error("Data is required to save in Redis");

        const value = typeof data === "string" ? data : JSON.stringify(data);

        // console.log("value for redis", value);
        // console.log("type of data", typeof data);
        // console.log("type of value", typeof value);

        await connection.set(key, value);

        console.log(`📌 Saved to Redis → ${key}`);

        return { success: true };

    } catch (err){
        console.error("❌ Redis Save Error:", err.message);
        return { success: false, message: err.message };
    }
}

/**
 * Get Data from Redis
 */
async function getFromRedis(key) {
  try {
    if (!key) throw new Error("Redis key is required");

    const raw = await connection.get(key);
    if (!raw) return null;

    try {
      return JSON.parse(raw); // if JSON, parse it
    } catch {
      return raw; // return raw string if not JSON
    }

  } catch (err) {
    console.error("❌ Redis Get Error:", err.message);
    return null;
  }
}

/**
 * Delete Data from Redis
 */
async function deleteFromRedis(key) {
  try {
    if (!key) throw new Error("Redis key is required");

    const result = await connection.del(key);

    if (result === 1) {
      console.log(`🗑️ Deleted Redis Key → ${key}`);
      return { success: true };
    } else {
      console.log(`⚠️ Key Not Found → ${key}`);
      return { success: false, message: "Key not found" };
    }

  } catch (err) {
    console.error("❌ Redis Delete Error:", err.message);
    return { success: false, message: err.message };
  }
}

module.exports = {
  saveToRedis,
  getFromRedis,
  deleteFromRedis,
};