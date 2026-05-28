const ServiceRequest = require("../models/ServiceRequest");
const Restaurant = require("../models/Restaurant");
const Notification = require("../models/NotificationModel");
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/ErrorResponse");
const redisClient = require("../config/redis");

// Create a new assistance request from a specific physical table stand
exports.requestService = asyncHandler(async (req, res, next) => {
  const { restaurantId, tableNumber, message } = req.body;

  // Track historical constraints within a rolling three minute boundary window
  const threeMinsAgo = new Date(Date.now() - 3 * 60 * 1000);
  const recentRequest = await ServiceRequest.findOne({
    restaurant: restaurantId,
    tableNumber,
    createdAt: { $gte: threeMinsAgo },
    status: { $in: ["Pending", "Acknowledged"] },
  });

  if (recentRequest) {
    return next(
      new ErrorResponse(
        "Waiter is already informed. Please wait a moment.",
        429,
      ),
    );
  }

  // Persist structural service request document inside data layer cluster
  const request = await ServiceRequest.create({
    restaurant: restaurantId,
    tableNumber,
    message: message || "Need assistance",
  });

  // Invalidation Lock: Flush dynamic system caches immediately to push live socket updates
  try {
    const restaurantIdStr = restaurantId.toString();
    await Promise.all([
      redisClient.del(`notifications:user:${restaurantIdStr}`),
      redisClient.del(`dashboard_analytics:${restaurantIdStr}`),
    ]);
  } catch (cacheErr) {
    console.error("Redis Cache Invalidation Error:", cacheErr.message);
  }

  res.status(200).json({
    success: true,
    message: "Waiter called successfully",
    data: request,
  });

  try {
    const title = `Table ${tableNumber} Calling`;
    const body = message
      ? `Request: ${message}`
      : "Customer needs assistance at their table.";

    // Register terminal alert data into tracking notifications model
    await Notification.create({
      recipientModel: "Restaurant",
      recipientId: restaurantId,
      title: title,
      message: body,
      type: "WAITER_CALL",
      relatedId: request._id,
    });
  } catch (error) {
    console.error("Waiter Call DB Notification failed:", error);
  }
});

// Update execution flags or status parameters from administration counter logs
exports.respondToService = asyncHandler(async (req, res, next) => {
  const { responseMsg, status } = req.body;
  const restaurantIdStr = req.user.id.toString();

  const request = await ServiceRequest.findOneAndUpdate(
    { _id: req.params.id, restaurant: req.user.id },
    { ownerResponse: responseMsg, status: status || "Acknowledged" },
    { new: true },
  );

  if (!request) {
    return next(new ErrorResponse("Request not found", 404));
  }

  // Invalidation Lock: Clear cached snapshot arrays to allow real time tracking panel refresh
  try {
    await Promise.all([
      redisClient.del(`notifications:user:${restaurantIdStr}`),
      redisClient.del(`dashboard_analytics:${restaurantIdStr}`),
    ]);
  } catch (cacheErr) {
    console.error("Redis Cache Invalidation Error:", cacheErr.message);
  }

  res.status(200).json({
    success: true,
    message: "Response sent to customer",
    data: request,
  });
});
