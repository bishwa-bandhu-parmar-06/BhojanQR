const Notification = require("../models/NotificationModel");
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/ErrorResponse"); // Error handle karne ke liye

// 1. Get all notifications for logged-in user
exports.getNotifications = asyncHandler(async (req, res, next) => {
  const notifications = await Notification.find({ recipientId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);

  const unreadCount = await Notification.countDocuments({
    recipientId: req.user._id,
    isRead: false,
  });

  res.status(200).json({
    success: true,
    unreadCount,
    data: notifications,
  });
});

// 2. Mark ALL notifications as read (Bulk Read)
exports.markAllAsRead = asyncHandler(async (req, res, next) => {
  await Notification.updateMany(
    { recipientId: req.user._id, isRead: false },
    { $set: { isRead: true } },
  );

  res.status(200).json({
    success: true,
    message: "All notifications marked as read",
  });
});

// 3. Mark SINGLE notification as read
exports.markSingleAsRead = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipientId: req.user._id },
    { isRead: true },
    { new: true },
  );

  if (!notification) {
    return next(
      new ErrorResponse("Notification not found or unauthorized", 404),
    );
  }

  res.status(200).json({
    success: true,
    data: notification,
  });
});

// 4. Delete SINGLE notification
exports.deleteSingleNotification = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    recipientId: req.user._id,
  });

  if (!notification) {
    return next(
      new ErrorResponse("Notification not found or unauthorized", 404),
    );
  }

  res.status(200).json({
    success: true,
    message: "Notification deleted successfully",
  });
});

// 5. Delete ALL notifications (Bulk Delete)
exports.deleteAllNotifications = asyncHandler(async (req, res, next) => {
  await Notification.deleteMany({ recipientId: req.user._id });

  res.status(200).json({
    success: true,
    message: "All notifications deleted successfully",
  });
});
