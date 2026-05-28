const AppConfig = require("../models/AppConfig");
const asyncHandler = require("../middleware/asyncHandler");
const redisClient = require("../config/redis");

// Get the global application version configuration with caching layer
exports.getAppVersion = asyncHandler(async (req, res, next) => {
  const cacheKey = "app_config:global";

  try {
    // Check if configuration exists in memory cache
    const cachedConfig = await redisClient.get(cacheKey);
    if (cachedConfig) {
      return res.status(200).json({
        success: true,
        source: "redis",
        data: JSON.parse(cachedConfig),
      });
    }
  } catch (cacheErr) {
    console.error("Redis Cache Read Error:", cacheErr.message);
  }

  // Database fallback if memory cache is not present
  let config = await AppConfig.findOne();

  // If database is completely empty provide standard structure to avoid application crash
  if (!config) {
    config = {
      minVersion: "1.0.0",
      latestVersion: "1.0.0",
      updateUrl:
        "https://play.google.com/store/apps/details?id=com.bhojanqrmobile",
      message: "Please update your app to the latest version.",
      forceUpdate: true,
    };
  }

  try {
    // Save configuration parameters to memory store for twenty four hours
    await redisClient.setEx(cacheKey, 86400, JSON.stringify(config));
  } catch (cacheSetErr) {
    console.error("Redis Cache Write Error:", cacheSetErr.message);
  }

  res.status(200).json({
    success: true,
    source: "database",
    data: config,
  });
});

// Create or update the core version metrics inside administration dashboard
exports.updateAppVersion = asyncHandler(async (req, res, next) => {
  // Extract configuration parameters from request body
  const { minVersion, latestVersion, updateUrl, message, forceUpdate } =
    req.body;
  const cacheKey = "app_config:global";

  // Validate incoming fields to ensure data integrity
  if (!minVersion || !latestVersion || !updateUrl) {
    return res.status(400).json({
      success: false,
      message: "Please provide minVersion, latestVersion, and updateUrl.",
    });
  }

  let config = await AppConfig.findOne();

  if (config) {
    // Modify existing document state with incoming data structures
    config.minVersion = minVersion;
    config.latestVersion = latestVersion;
    config.updateUrl = updateUrl;
    config.message = message;
    config.forceUpdate = forceUpdate;

    await config.save();
  } else {
    // Generate primary configuration document on cluster initialization
    config = await AppConfig.create({
      minVersion,
      latestVersion,
      updateUrl,
      message,
      forceUpdate,
    });
  }

  // Invalidation Lock: Destroy outdated global key immediately to sync connected runtimes
  try {
    await redisClient.del(cacheKey);
  } catch (cacheDelErr) {
    console.error("Redis Cache Invalidation Error:", cacheDelErr.message);
  }

  res.status(200).json({
    success: true,
    message: "App version configuration updated successfully!",
    data: config,
  });
});
