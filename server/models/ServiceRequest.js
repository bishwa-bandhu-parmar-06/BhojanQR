const mongoose = require("mongoose");

const serviceRequestSchema = new mongoose.Schema(
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
    message: {
      type: String,
      maxLength: 100,
      default: "Need assistance",
    },
    status: {
      type: String,
      enum: ["Pending", "Acknowledged", "Resolved"],
      default: "Pending",
    },
    ownerResponse: {
      type: String,
      default: null,
    },
    customerFcmToken: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

serviceRequestSchema.index({ restaurant: 1, tableNumber: 1, createdAt: -1 });
module.exports = mongoose.model("ServiceRequest", serviceRequestSchema);
