const AppConfig = require("../models/AppConfig");
const asyncHandler = require("../middleware/asyncHandler");

exports.getAppVersion = asyncHandler(async (req, res, next) => {
  // Hum maan ke chal rahe hain DB mein sirf 1 hi config document hoga
  let config = await AppConfig.findOne();

  // Agar DB khali hai (first time), toh ek default response bhej do taaki app crash na ho
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

  res.status(200).json({
    success: true,
    data: config,
  });
});

exports.updateAppVersion = asyncHandler(async (req, res, next) => {
  // 1. Frontend se aane wala saara data nikal lo
  const { minVersion, latestVersion, updateUrl, message, forceUpdate } =
    req.body;

  // 2. Thodi si validation (Taki empty data save na ho)
  if (!minVersion || !latestVersion || !updateUrl) {
    return res.status(400).json({
      success: false,
      message: "Please provide minVersion, latestVersion, and updateUrl.",
    });
  }

  // 3. Check karo ki DB mein pehle se config hai ya nahi
  let config = await AppConfig.findOne();

  if (config) {
    // Agar hai, toh bas usko naye data se update kar do
    config.minVersion = minVersion;
    config.latestVersion = latestVersion;
    config.updateUrl = updateUrl;
    config.message = message;
    config.forceUpdate = forceUpdate;

    await config.save();
  } else {
    // Agar DB bilkul khali hai (first time), toh naya document bana do
    config = await AppConfig.create({
      minVersion,
      latestVersion,
      updateUrl,
      message,
      forceUpdate,
    });
  }

  // 4. Success response bhej do
  res.status(200).json({
    success: true,
    message: "App version configuration updated successfully! 🚀",
    data: config,
  });
});
