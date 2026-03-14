const express = require("express");
const {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
  logoutAdmin,
  updateAdminProfile,
  getPendingRestaurants,
  getApprovedRestaurants,
  getRejectedRestaurants,

  approveRestaurant,
  rejectRestaurant,
  getPublicAdminContact,
} = require("../controllers/adminController");

const {
  validateAdminRegister,
  validateAdminLogin,
} = require("../validators/Adminvalidators");

const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// PUBLIC
router.post("/register", validateAdminRegister, registerAdmin);
router.post("/login", validateAdminLogin, loginAdmin);
router.get("/public/contact", getPublicAdminContact);

// PROTECTED
router.use(protect);
router.use(authorize("admin"));

router.get("/profile", getAdminProfile);
router.post("/logout", logoutAdmin);
router.post("/edit-profile", updateAdminProfile);

// Admin-only Restaurant Management Routes
router.get("/restaurants/pending", getPendingRestaurants);
router.get("/restaurants/approved", getApprovedRestaurants);
router.get("/restaurants/rejected", getRejectedRestaurants);

router.post("/restaurants/:id/approve", approveRestaurant);
router.post("/restaurants/:id/reject", rejectRestaurant);
module.exports = router;
