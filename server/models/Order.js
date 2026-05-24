const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    customerName: { type: String, required: true },
    tableNumber: { type: Number, required: true },
    items: {
      type: [
        {
          menuItem: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "MenuItem",
            required: true,
          },
          quantity: { type: Number, required: true, min: 1 },
          name: String,
          price: Number,
          imageUrl: String,
        },
      ],
      validate: [(v) => v.length > 0, "Order must have at least one item"],
    },
    totalPrice: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["Pending", "Preparing", "Completed", "Cancelled"],
      default: "Pending",
    },
    cancellationReason: {
      type: String,
      default: null,
    },
    eta: {
      type: String,
      default: null,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "failed", "Paid", "Refunded"],
      default: "pending",
    },
    customerFcmToken: {
      type: String,
      default: null,
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
  },
  { timestamps: true },
);

orderSchema.index({ restaurant: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1 });

module.exports = mongoose.model("Order", orderSchema);
