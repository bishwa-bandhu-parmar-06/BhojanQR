const Admin = require("../models/Admin");
const Restaurant = require("../models/Restaurant");
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/ErrorResponse");
const sendTokenResponse = require("../utils/sendTokenResponse");
const redisClient = require("../config/redis");
const Order = require("../models/Order");
const Menu = require("../models/Menu");
const mongoose = require("mongoose");
const sendPushNotification = require("../utils/fcmHelper");
const Notification = require("../models/NotificationModel");
const sendEmail = require("../utils/sendEmail");

// Helper function to clear all restaurant lists in admin cache at once
const clearAdminRestaurantCache = async () => {
  try {
    await Promise.all([
      redisClient.del("admin_restaurants:pending"),
      redisClient.del("admin_restaurants:approved"),
      redisClient.del("admin_restaurants:rejected"),
    ]);
  } catch (err) {
    console.error("Redis Admin Cache Clear Error:", err.message);
  }
};

// Controller to register admin account
exports.registerAdmin = asyncHandler(async (req, res, next) => {
  const { name, email, mobile, password } = req.body;

  const adminExists = await Admin.findOne({ email });

  if (adminExists) {
    return next(new ErrorResponse("Admin already exists with this email", 400));
  }

  const admin = await Admin.create({
    name,
    email,
    mobile,
    password,
  });

  sendTokenResponse(admin, 201, res);
});

// Controller to login as admin
exports.loginAdmin = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email }).select("+password");

  if (!admin) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  const isMatch = await admin.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  sendTokenResponse(admin, 200, res);
});

// Controller to get admin profile details
exports.getAdminProfile = asyncHandler(async (req, res, next) => {
  const cacheKey = `admin_profile:${req.user.id}`;

  const cached = await redisClient.get(cacheKey);

  if (cached) {
    return res.status(200).json({
      success: true,
      source: "redis",
      data: JSON.parse(cached),
    });
  }

  const admin = await Admin.findById(req.user.id);

  if (!admin) {
    return next(new ErrorResponse("Admin not found", 404));
  }

  await redisClient.setEx(cacheKey, 3600, JSON.stringify(admin));

  res.status(200).json({
    success: true,
    source: "database",
    data: admin,
  });
});

// Controller to update admin profile details
exports.updateAdminProfile = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    mobile: req.body.mobile,
  };

  const admin = await Admin.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  if (!admin) {
    return next(new ErrorResponse("Admin not found", 404));
  }

  await redisClient.del(`admin_profile:${req.user.id}`);

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    admin: admin,
  });
});

// Controller to logout admin and clear session cache
exports.logoutAdmin = asyncHandler(async (req, res, next) => {
  if (req.user) {
    await redisClient.del(`admin_profile:${req.user.id}`);
  }

  res.clearCookie("token", { httpOnly: true });

  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
});

// Get pending restaurants list with redis caching layer
exports.getPendingRestaurants = asyncHandler(async (req, res, next) => {
  const cacheKey = "admin_restaurants:pending";

  const cached = await redisClient.get(cacheKey);
  if (cached) {
    const data = JSON.parse(cached);
    return res.status(200).json({
      success: true,
      source: "redis",
      count: data.length,
      data: data,
    });
  }

  const restaurants = await Restaurant.find({ status: "pending" })
    .select("-password")
    .sort("-createdAt");

  await redisClient.setEx(cacheKey, 1800, JSON.stringify(restaurants));

  res.status(200).json({
    success: true,
    source: "database",
    count: restaurants.length,
    data: restaurants,
  });
});

// Get approved restaurants list with redis caching layer
exports.getApprovedRestaurants = asyncHandler(async (req, res, next) => {
  const cacheKey = "admin_restaurants:approved";

  const cached = await redisClient.get(cacheKey);
  if (cached) {
    const data = JSON.parse(cached);
    return res.status(200).json({
      success: true,
      source: "redis",
      count: data.length,
      data: data,
    });
  }

  const restaurants = await Restaurant.find({ status: "approved" })
    .select("-password")
    .sort("-createdAt");

  await redisClient.setEx(cacheKey, 1800, JSON.stringify(restaurants));

  res.status(200).json({
    success: true,
    source: "database",
    count: restaurants.length,
    data: restaurants,
  });
});

// Get rejected restaurants list with redis caching layer
exports.getRejectedRestaurants = asyncHandler(async (req, res, next) => {
  const cacheKey = "admin_restaurants:rejected";

  const cached = await redisClient.get(cacheKey);
  if (cached) {
    const data = JSON.parse(cached);
    return res.status(200).json({
      success: true,
      source: "redis",
      count: data.length,
      data: data,
    });
  }

  const restaurants = await Restaurant.find({ status: "rejected" })
    .select("-password")
    .sort("-createdAt");

  await redisClient.setEx(cacheKey, 1800, JSON.stringify(restaurants));

  res.status(200).json({
    success: true,
    source: "database",
    count: restaurants.length,
    data: restaurants,
  });
});

// Controller to approve the restaurant profile
exports.approveRestaurant = asyncHandler(async (req, res, next) => {
  const restaurant = await Restaurant.findById(req.params.id);

  if (!restaurant) {
    return next(new ErrorResponse("Restaurant not found", 404));
  }

  restaurant.status = "approved";
  await restaurant.save();

  // Invalidation Lock: Clear lists and profile cache to sync real-time database state
  await redisClient.del(`restaurant_profile:${req.params.id}`);
  await clearAdminRestaurantCache();

  res.status(200).json({
    success: true,
    message: "Restaurant approved successfully",
    data: restaurant,
  });

  try {
    const title = "Account Approved!";
    const message = `Hi ${restaurant.ownerName}, your restaurant ${restaurant.restaurantName} is now active. Welcome to BhojanQR!`;
    const type = "ACCOUNT_APPROVED";

    // Create system database notification
    await Notification.create({
      recipientModel: "Restaurant",
      recipientId: restaurant._id,
      title,
      message,
      type,
    });

    // Send onboarding email notification
    sendEmail({
      email: restaurant.email,
      subject: title,
      message: message,
    });
  } catch (error) {
    console.error("Approval Background Notification Error:", error);
  }
});

// Controller to reject the restaurant onboarding application
exports.rejectRestaurant = asyncHandler(async (req, res, next) => {
  const restaurant = await Restaurant.findById(req.params.id);

  if (!restaurant) {
    return next(new ErrorResponse("Restaurant not found", 404));
  }

  restaurant.status = "rejected";
  await restaurant.save();

  // Invalidation Lock: Remove outdated lists and profile cache entries
  await redisClient.del(`restaurant_profile:${req.params.id}`);
  await clearAdminRestaurantCache();

  res.status(200).json({
    success: true,
    message: "Restaurant rejected",
    data: restaurant,
  });

  try {
    const title = "Account Update";
    const message = `Hi ${restaurant.ownerName}, unfortunately your registration for ${restaurant.restaurantName} has been rejected. Please contact support for details.`;
    const type = "ACCOUNT_REJECTED";

    // Create system rejection database notification
    await Notification.create({
      recipientModel: "Restaurant",
      recipientId: restaurant._id,
      title,
      message,
      type,
    });

    // Send email alert for onboarding update
    sendEmail({
      email: restaurant.email,
      subject: title,
      message: message,
    });
  } catch (error) {
    console.error("Rejection Background Notification Error:", error);
  }
});

// Controller to get public support contact data
exports.getPublicAdminContact = asyncHandler(async (req, res, next) => {
  const cacheKey = "public_admin_contact";
  const cached = await redisClient.get(cacheKey);

  if (cached) {
    return res.status(200).json({
      success: true,
      source: "redis",
      data: JSON.parse(cached),
    });
  }
  const admin = await Admin.findOne().select("email -_id").sort("createdAt");

  if (!admin) {
    return next(new ErrorResponse("Admin contact not found", 404));
  }

  const contactData = { email: admin.email };

  await redisClient.setEx(cacheKey, 86400, JSON.stringify(contactData));

  res.status(200).json({
    success: true,
    source: "database",
    data: contactData,
  });
});

// Batch update status logic triggered via administrative dashboard
exports.updateRestaurantStatusAdmin = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const restaurant = await Restaurant.findById(req.params.id);

  if (!restaurant) {
    return next(new ErrorResponse("Restaurant not found", 404));
  }

  restaurant.status = status;
  await restaurant.save();

  // Invalidation Lock: Reset operational caching namespaces
  await redisClient.del(`restaurant_profile:${req.params.id}`);
  await clearAdminRestaurantCache();

  res.status(200).json({
    success: true,
    message: `Restaurant marked as ${status}`,
    data: restaurant,
  });

  let title = "";
  let message = "";
  let type = "";

  if (status === "approved") {
    title = "Account Approved!";
    message = `Hi ${restaurant.ownerName}, your restaurant ${restaurant.restaurantName} is now active. Welcome to BhojanQR!`;
    type = "ACCOUNT_APPROVED";
  } else if (status === "rejected") {
    title = "Account Update";
    message = `Hi ${restaurant.ownerName}, unfortunately your registration for ${restaurant.restaurantName} has been rejected. Please contact support.`;
    type = "ACCOUNT_REJECTED";
  }

  if (title && message) {
    try {
      await Notification.create({
        recipientModel: "Restaurant",
        recipientId: restaurant._id,
        title,
        message,
        type,
      });

      sendEmail({
        email: restaurant.email,
        subject: title,
        message: message,
      });
    } catch (error) {
      console.error("Status Update Notification Error:", error);
    }
  }
});

// Fetch detailed business metrics for single restaurant inside administration panel
exports.getRestaurantDetailsAdmin = asyncHandler(async (req, res, next) => {
  const restaurantId = req.params.id;
  const cacheKey = `admin_restaurant_details:${restaurantId}`;

  const cached = await redisClient.get(cacheKey);
  if (cached) {
    return res.status(200).json({
      success: true,
      source: "redis",
      data: JSON.parse(cached),
    });
  }

  const restaurant =
    await Restaurant.findById(restaurantId).select("-password");
  if (!restaurant) {
    return next(new ErrorResponse("Restaurant not found", 404));
  }

  const totalMenus = await Menu.countDocuments({ restaurant: restaurantId });
  const totalOrders = await Order.countDocuments({ restaurant: restaurantId });

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const todaysOrders = await Order.countDocuments({
    restaurant: restaurantId,
    createdAt: { $gte: startOfDay },
  });

  const revenueData = await Order.aggregate([
    {
      $match: {
        restaurant: new mongoose.Types.ObjectId(restaurantId),
        paymentStatus: "Paid",
      },
    },
    { $group: { _id: null, total: { $sum: "$totalPrice" } } },
  ]);
  const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

  const responseData = {
    restaurant,
    stats: {
      totalMenus,
      todaysOrders,
      totalOrders,
      totalRevenue,
    },
  };

  // Cache configuration for operational analytics telemetry
  await redisClient.setEx(cacheKey, 600, JSON.stringify(responseData));

  res.status(200).json({
    success: true,
    source: "database",
    data: responseData,
  });
});
