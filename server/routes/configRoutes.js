const express = require("express");
const {
  getAppVersion
} = require("../controllers/configController");



const router = express.Router();

router.get("/app-version", getAppVersion);
module.exports = router;