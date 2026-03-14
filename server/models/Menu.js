const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    name: { type: String, required: true },
    price: {
      type: Number,
      required: true,
      min: 0,
      get: (v) => (v / 100).toFixed(2),
      set: (v) => v * 100,
    },
    category: {
      type: String,
      enum: ["Main Course", "Starter", "Dessert", "Beverage"],
      required: true,
    },
    imageUrl: { type: String, required: true },
    description: { type: String },
    isDeleted: { type: Boolean, default: false },
    available: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: { getters: true }, toObject: { getters: true } },
);
menuItemSchema.index({ restaurant: 1, category: 1 });
menuItemSchema.index({ restaurant: 1, name: 1 });
module.exports = mongoose.model("MenuItem", menuItemSchema);
