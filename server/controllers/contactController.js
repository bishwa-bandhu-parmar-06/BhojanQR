const Contact = require("../models/contactModel");
const asyncHandler = require("../middleware/asyncHandler");
const redisClient = require("../config/redis");

// Submit support query or business inquiries via landing page form
exports.submitContactForm = asyncHandler(async (req, res, next) => {
  // Extract user parameters from request boundary payload
  const { name, email, mobile, message } = req.body;

  // Persist transaction record directly into database
  const contactMessage = await Contact.create({
    name,
    email,
    mobile,
    message,
  });

  // Invalidation Lock: Remove administrative inquiry lists from cache layer
  // This forces the administration panel to synchronize incoming requests in real time
  try {
    await redisClient.del("admin_analytics:inquiries");
  } catch (cacheDelErr) {
    console.error("Redis Cache Invalidation Error:", cacheDelErr.message);
  }

  res.status(201).json({
    success: true,
    message: "Message sent successfully",
    data: contactMessage,
  });
});
