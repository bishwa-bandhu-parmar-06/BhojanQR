const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  name: { type: String, required: [true, "Name is required"], trim: true },
  email: {
    type: String,
    required: [true, "Email is required"],
    lowercase: true,
  },
  mobile: { type: String, required: [true, "Mobile number is required"] },
  message: {
    type: String,
    required: [true, "Message is required"],
    maxLength: 2000,
  },
  status: {
    type: String,
    enum: ["pending", "read", "replied"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Contact", contactSchema);
