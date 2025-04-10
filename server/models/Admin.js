const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String, required: true, unique: true },
    otp: { type: String, required: false }, // Store OTP temporarily
    isVerified: { type: Boolean, default: false }, // After OTP verification
    profilePhoto: { type: String, default: "" }, // ✅ New field for storing image path

    newEmail: { type: String },
    emailChangeOTP: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Admin", adminSchema);
