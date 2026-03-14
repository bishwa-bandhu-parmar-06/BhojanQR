const express = require("express");
const router = express.Router();

const {
  getPublicMenu,
  getMyMenu,
  addMenuItem,
  updateMenuItem,
  updateMenuAvailability,
  deleteMenuItem,
  getAllMenuItems,
} = require("../controllers/menuController");

// Import middleware
const { upload } = require("../config/cloudinary");
const { protect, authorize } = require("../middleware/authMiddleware");
const { validateMenuItem } = require("../validators/menuValidator.js");

// ==========================================
// 1. PUBLIC ROUTES (Anyone can view these)
// ==========================================
router.get("/public/:restaurantId", getPublicMenu);
router.get("/all", getAllMenuItems); // MOVED HERE! Must be accessible to users.

// ==========================================
// 2. PROTECTED ROUTES (Restaurants only)
// ==========================================
router.use(protect);
router.use(authorize("restaurant"));

router.get("/owner/my-menu", getMyMenu);

router.post("/add", upload.single("image"), validateMenuItem, addMenuItem);
router.post("/update/:id", upload.single("image"), updateMenuItem);
router.post("/:id/availability", updateMenuAvailability);
router.post("/:id", deleteMenuItem);

module.exports = router;
