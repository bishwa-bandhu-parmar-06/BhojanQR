const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit"); // Rate limiter import kiya

const {
  requestService,
  respondToService,
} = require("../controllers/serviceController");
const { protect } = require("../middleware/authMiddleware");


const callWaiterLimiter = rateLimit({
  windowMs: 3 * 60 * 1000, // 3 minutes ki window
  max: 2, // Ek IP address se 3 minute me maximum 2 requests allow hongi
  message: {
    success: false,
    message: "You have already called the waiter. Please wait a few minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ==========================================
// PUBLIC ROUTE (Customer ke liye)
// ==========================================
// Yahan requestService se pehle callWaiterLimiter laga diya
router.post("/call", callWaiterLimiter, requestService);

// ==========================================
// PROTECTED ROUTE (Restaurant Owner ke liye)
// ==========================================
router.put("/respond/:id", protect, respondToService);

module.exports = router;
