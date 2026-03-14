// models/QRCode.js
const mongoose = require("mongoose");

const qrCodeSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    tableNumber: {
      type: Number,
      required: true,
    },
    qrImageUrl: {
      type: String,
      required: true, // The Cloudinary URL
    },
    scanUrl: {
      type: String,
      required: true, // The actual link the QR points to
    },
  },
  { timestamps: true },
);

// Ensure a restaurant cannot have duplicate table numbers
qrCodeSchema.index({ restaurant: 1, tableNumber: 1 }, { unique: true });

module.exports = mongoose.model("QRCode", qrCodeSchema);
