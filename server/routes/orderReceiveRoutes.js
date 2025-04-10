const express = require("express");
const {
  getAllOrders,
  getOrderByToken,
} = require("../controllers/orderReceivedController");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

router.get("/order-receive", getAllOrders);
router.get("/:token", getOrderByToken);

module.exports = router;
