const express = require("express");
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  createOrder,
  verifyPayment,
  getOrderById,
  updateOrderStatus,
} = require("../controllers/orderController");

// Routes
router.post("/create-order", createOrder);
router.post("/verify-payment", verifyPayment);

// ✅ Protected routes
router.get('/:id', authMiddleware, getOrderById);
router.put('/:id/status', authMiddleware, updateOrderStatus);

module.exports = router;
