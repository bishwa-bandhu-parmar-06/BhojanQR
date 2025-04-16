const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  tableNumber: { type: Number, required: true },
  items: [
    {
      menuItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Menu",
        required: true,
      },
      quantity: { type: Number, required: true },
      name: String,
      price: Number,
      imageUrl: String,
    },
  ],
  totalPrice: { type: Number, required: true },

  status: {
    type: String,
    enum: ["Pending", "Preparing", "Completed"],
    default: "Pending",
  },

  paymentStatus: {
    type: String,
    enum: ["pending", "success", "failed", "Paid"],
    default: "pending",
  },

  razorpayOrderId: String,
  razorpayPaymentId: String,

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", orderSchema);
