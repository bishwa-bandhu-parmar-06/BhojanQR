const express = require("express");
const router = express.Router();

const {
  addMenuItem,
  getAllMenuItems,
  deleteMenuItem,
  updateMenuItem,
  getMenuItemById,
  updateMenuAvailability,
} = require("../controllers/menuController");

const { upload } = require("../config/cloudinary");
const adminAuth = require("../middleware/adminAuth"); // middleware (JWT/session)

// Add menu item (image required)
router.post("/add", adminAuth, upload.single("image"), addMenuItem);

// Get all items (paginated + search)
router.get("/", getAllMenuItems);

// Get one item
router.get("/:id", getMenuItemById);

// Update menu item
router.put("/update/:id", adminAuth, upload.single("image"), updateMenuItem);

// Soft delete
router.delete("/:id", adminAuth, deleteMenuItem);

// ✅ PATCH route to update availability
router.patch("/:id/availability", adminAuth, updateMenuAvailability);
module.exports = router;
