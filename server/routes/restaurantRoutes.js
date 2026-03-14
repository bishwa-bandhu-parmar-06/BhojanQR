const express = require("express");
const router = express.Router();

const {
  registerRestaurant,
  loginRestaurant,
  getProfile,
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  logoutRestaurant,
  getDashboardStats,
  getPublicRestaurantDetails,
} = require("../controllers/restaurantController");

const {
  validateRestaurantRegister,
  validateRestaurantLogin,
} = require("../validators/restaurantValidator");

const { protect, authorize } = require("../middleware/authMiddleware");
const { upload } = require("../config/cloudinary");
const {
  getSavedQRs,
  generateAndSaveQRs,
  deleteQR,
} = require("../controllers/qrController");
router.post(
  "/register",
  upload.single("govtIdDocument"),
  validateRestaurantRegister,
  registerRestaurant,
);
router.post("/login", validateRestaurantLogin, loginRestaurant);
router.get("/public/:id", getPublicRestaurantDetails);
router.use(protect);
router.use(authorize("restaurant"));

router.get("/profile", getProfile);

router.post("/edit-profile", updateProfile);
router.post("/add-address", addAddress);
router.post("/update-address/:addressId", updateAddress);
router.post("/delete-address/:addressId", deleteAddress);

router.get("/qr", getSavedQRs);
router.post("/qr/generate", generateAndSaveQRs);
router.post("/qr/delete/:id", deleteQR);

router.post("/logout", logoutRestaurant);
router.get("/dashboard-stats", getDashboardStats);
module.exports = router;
