const express = require("express");
const router = express.Router();
const {
  getAppVersion,
  updateAppVersion,
} = require("../controllers/configController");

// 🌟 Agar aapke paas koi admin check wala middleware hai, toh use yahan laga lein (e.g., protect, authorize('admin'))
const { protect, authorize } = require('../middleware/authMiddleware');

// Public route: App start hote hi check karegi
router.get("/app-version", getAppVersion);

// Admin route: App Version Manager form se data yahan aayega
// router.post("/app-version/update", updateAppVersion);
router.post('/app-version/update', protect, authorize('admin'), updateAppVersion);

module.exports = router;
