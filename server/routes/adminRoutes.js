const express = require("express");
const {
  registerAdmin,
  verifyOTPAndRegister,
  loginAdmin,
  verifyOTPAndLogin,
  getAdminProfile,
  updateAdminProfile,
  upload,
  requestEmailChange,
  verifyEmailChange,
  logoutAdmin,
  verifyToken,
} = require("../controllers/adminController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes
router.post("/register", registerAdmin);
router.post("/verify-register", verifyOTPAndRegister);
router.post("/login", loginAdmin);
router.post("/verify-login", verifyOTPAndLogin);

// Protected routes
router.get("/verify-token", verifyToken);
router.get("/profile", authMiddleware, getAdminProfile);
router.put(
  "/update-profile",
  authMiddleware,
  upload.single("image"),
  updateAdminProfile
);
router.post("/request-email-change", authMiddleware, requestEmailChange);
router.post("/verify-email-change", authMiddleware, verifyEmailChange);
router.post("/logout", authMiddleware, logoutAdmin);

module.exports = router;
