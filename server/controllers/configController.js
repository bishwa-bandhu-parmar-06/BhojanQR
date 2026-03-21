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
