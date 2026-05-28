const order = require("../models/Order");
const redisClient = require("../config/redis");

// Fetch all system wide orders with memory caching layer to reduce cluster overhead
exports.getAllOrders = async (req, res) => {
  const cacheKey = "orders:all:global";

  try {
    // Check if global orders list snapshot exists inside memory cache
    const cachedOrders = await redisClient.get(cacheKey);
    if (cachedOrders) {
      return res.status(200).json({
        success: true,
        source: "redis",
        response: JSON.parse(cachedOrders),
      });
    }

    // Database operation fallback sorting by creation date in descending order
    const allOrders = await order.find().sort({ createdAt: -1 });

    // Set configuration limits to preserve this heavy data list in cache for five minutes
    await redisClient.setEx(cacheKey, 300, JSON.stringify(allOrders));

    res.status(200).json({
      success: true,
      source: "database",
      response: allOrders,
    });
  } catch (error) {
    console.error("Global orders lookup execution failure:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      response: error.message,
    });
  }
};

// Retrieve a specific single transaction object using payment verification token
exports.getOrderByToken = async (req, res) => {
  try {
    const { token } = req.params;
    const cacheKey = `order:token:${token}`;

    // Read stored dataset memory tracking reference directly to minimize database lookup delay
    const cachedOrder = await redisClient.get(cacheKey);
    if (cachedOrder) {
      return res.status(200).json(JSON.parse(cachedOrder));
    }

    const orderData = await order.findOne({ razorpayPaymentId: token });

    if (!orderData) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Persist single transaction profile log inside memory cache for five minutes
    await redisClient.setEx(cacheKey, 300, JSON.stringify(orderData));

    res.status(200).json(orderData);
  } catch (error) {
    console.error("Single order token retrieval state failure:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
