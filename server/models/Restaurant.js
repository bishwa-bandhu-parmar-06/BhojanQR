const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const restaurantSchema = new mongoose.Schema(
  {
    restaurantName: {
      type: String,
      required: true,
      trim: true,
      maxLength: 100,
    },
    ownerName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
    },
    address: [
      {
        street: { type: String, required: false, trim: true },
        area: { type: String, required: false, trim: true },
        landmark: { type: String, required: false, trim: true },
        city: { type: String, required: false, trim: true },
        state: { type: String, required: false, trim: true },
        pincode: { type: String, required: false, trim: true },
      },
    ],
    govtIdDetails: {
      idType: {
        type: String,
        enum: ["FSSAI", "GSTIN", "PAN", "Aadhar"],
        required: false,
      },
      idNumber: {
        type: String,
        required: false,
      },
      documentUrl: {
        type: String,
      },
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended"],
      default: "pending",
    },
    role: {
      type: String,
      default: "restaurant",
      enum: ["restaurant"],
    },
    fcmTokens: [
      {
        type: String,
      }
    ],
    isVerifiedEmail: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  },
);

// ==========================================
// MONGOOSE HOOKS (MIDDLEWARE)
// ==========================================

restaurantSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ==========================================
// INSTANCE METHODS
// ==========================================

restaurantSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

restaurantSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

restaurantSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model("Restaurant", restaurantSchema);
