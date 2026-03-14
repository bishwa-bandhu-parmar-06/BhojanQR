const express = require("express");
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  getOrderByToken,
  getRestaurantOrders,
  updateOrderStatus,
} = require("../controllers/orderController");

const { protect, authorize } = require("../middleware/authMiddleware");

// PUBLIC: Customers creating orders and checking status
router.post("/create-order", createOrder);
router.post("/verify-payment", verifyPayment);
router.get("/status/:token", getOrderByToken);

// PROTECTED (HOTEL ONLY): Viewing and managing orders
router.use(protect);
router.use(authorize("restaurant"));

router.get("/hotel-orders", getRestaurantOrders);
router.put("/:id/status", updateOrderStatus);

module.exports = router;
