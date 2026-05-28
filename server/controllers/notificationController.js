const Notification = require("../models/NotificationModel");
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/ErrorResponse");
const redisClient = require("../config/redis");

// Helper structure to generate unique cache keys for user notifications
const getNotificationCacheKey = (userId) => `notifications:user:${userId}`;

// Fetch all notifications and unread counts for the authenticated user with caching
exports.getNotifications = asyncHandler(async (req, res, next) => {
  const cacheKey = getNotificationCacheKey(req.user._id);

  try {
    // Attempt to retrieve pre calculated state from data store memory
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        success: true,
        source: "redis",
        ...JSON.parse(cachedData),
      });
    }
  } catch (cacheErr) {
    console.error("Redis Cache Read Error:", cacheErr.message);
  }

  // Database operation fallback if cache entry is absent
  const notifications = await Notification.find({ recipientId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);

  const unreadCount = await Notification.countDocuments({
    recipientId: req.user._id,
    isRead: false,
  });

  const responseData = {
    unreadCount,
    data: notifications,
  };

  try {
    // Keep notifications cached in memory for ten minutes
    await redisClient.setEx(cacheKey, 600, JSON.stringify(responseData));
  } catch (cacheSetErr) {
    console.error("Redis Cache Write Error:", cacheSetErr.message);
  }

  res.status(200).json({
    success: true,
    source: "database",
    ...responseData,
  });
});

// Mark all unread notification entries as read for the logged in session
exports.markAllAsRead = asyncHandler(async (req, res, next) => {
  await Notification.updateMany(
    { recipientId: req.user._id, isRead: false },
    { $set: { isRead: true } },
  );

  // Invalidation Lock: Remove outdated entry to sync real time modifications
  try {
    await redisClient.del(getNotificationCacheKey(req.user._id));
  } catch (cacheDelErr) {
    console.error("Redis Cache Invalidation Error:", cacheDelErr.message);
  }

  res.status(200).json({
    success: true,
    message: "All notifications marked as read",
  });
});

// Update read status configuration parameters for a single unique alert document
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

  // Invalidation Lock: Reset cached snapshot to enforce status consistency
  try {
    await redisClient.del(getNotificationCacheKey(req.user._id));
  } catch (cacheDelErr) {
    console.error("Redis Cache Invalidation Error:", cacheDelErr.message);
  }

  res.status(200).json({
    success: true,
    data: notification,
  });
});

// Remove a single notification log entry from database and flush related data store namespaces
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

  // Invalidation Lock: Purge memory namespace instantly
  try {
    await redisClient.del(getNotificationCacheKey(req.user._id));
  } catch (cacheDelErr) {
    console.error("Redis Cache Invalidation Error:", cacheDelErr.message);
  }

  res.status(200).json({
    success: true,
    message: "Notification deleted successfully",
  });
});

// Bulk remove all logs associated with the specific unique application user session
exports.deleteAllNotifications = asyncHandler(async (req, res, next) => {
  await Notification.deleteMany({ recipientId: req.user._id });

  // Invalidation Lock: Clear cache storage key completely
  try {
    await redisClient.del(getNotificationCacheKey(req.user._id));
  } catch (cacheDelErr) {
    console.error("Redis Cache Invalidation Error:", cacheDelErr.message);
  }

  res.status(200).json({
    success: true,
    message: "All notifications deleted successfully",
  });
});
