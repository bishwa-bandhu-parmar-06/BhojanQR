const redis = require("redis");
const dotenv = require("dotenv");

dotenv.config();

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

// Create the Redis client
const redisClient = redis.createClient({
  url: process.env.REDIS_URL,
});

// ==========================================
// EVENT LISTENERS FOR MONITORING
// ==========================================

redisClient.on("connect", () => {
  console.log(`${colors.cyan}Redis: Client connecting...${colors.reset}`);
});

redisClient.on("ready", () => {
  console.log(
    `${colors.green}Redis: Client connected and ready to use${colors.reset}`,
  );
});

redisClient.on("error", (err) => {
  console.error(
    `${colors.bold}${colors.red}Redis Error: ${err.message}${colors.reset}`,
  );
});

redisClient.on("end", () => {
  console.log(`${colors.yellow}Redis: Client disconnected${colors.reset}`);
});

// ==========================================
// INITIALIZE CONNECTION
// ==========================================

(async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error(
      `${colors.bold}${colors.red}Redis Startup Error: ${error.message}${colors.reset}`,
    );
  }
})();

module.exports = redisClient;
