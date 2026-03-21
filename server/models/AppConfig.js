const mongoose = require("mongoose");

const appConfigSchema = new mongoose.Schema(
  {
    minVersion: { type: String, required: true },
    latestVersion: { type: String, required: true },
    updateUrl: { type: String, required: true },
    message: {
      type: String,
      default:
        "A new version of BhojanQR is available. Please update to continue.",
    },
    forceUpdate: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("AppConfig", appConfigSchema);
