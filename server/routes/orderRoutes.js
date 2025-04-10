const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  createOrder,
  verifyPayment,
  updateOrderStatus,
  deleteOrder,
} = require("../controllers/orderController");

// Routes
router.post("/create-order", createOrder);
router.post("/verify-payment", verifyPayment);

// // ✅ Protected routes
// And in orderRoutes:
router.put("/orders/:id", updateOrderStatus);
// 👇 Add this DELETE route
router.delete("/orders/:id", deleteOrder);

module.exports = router;
