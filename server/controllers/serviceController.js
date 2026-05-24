const ServiceRequest = require("../models/ServiceRequest");
const Restaurant = require("../models/Restaurant");
const Notification = require("../models/NotificationModel");
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/ErrorResponse");

exports.requestService = asyncHandler(async (req, res, next) => {
  const { restaurantId, tableNumber, message } = req.body;

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

  const request = await ServiceRequest.create({
    restaurant: restaurantId,
    tableNumber,
    message: message || "Need assistance",
  });

  res.status(200).json({
    success: true,
    message: "Waiter called successfully",
    data: request,
  });

  try {
    const title = `🚨 Table ${tableNumber} Calling!`;
    const body = message
      ? `Request: ${message}`
      : "Customer needs assistance at their table.";

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

exports.respondToService = asyncHandler(async (req, res, next) => {
  const { responseMsg, status } = req.body;

  const request = await ServiceRequest.findOneAndUpdate(
    { _id: req.params.id, restaurant: req.user.id },
    { ownerResponse: responseMsg, status: status || "Acknowledged" },
    { new: true },
  );

  if (!request) return next(new ErrorResponse("Request not found", 404));

  res.status(200).json({
    success: true,
    message: "Response sent to customer",
    data: request,
  });

});
