const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipientModel: {
      type: String,
      required: true,
      enum: ["Admin", "Restaurant"],
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false, 
      refPath: "recipientModel",
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "NEW_REGISTRATION",
        "ACCOUNT_UPDATE",
        "NEW_ORDER",
        "ORDER_UPDATE",
        "SYSTEM",
        "ACCOUNT_APPROVED",
        "ACCOUNT_REJECTED",
        "WAITER_CALL" 
      ],
      default: "SYSTEM",
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Notification", notificationSchema);
