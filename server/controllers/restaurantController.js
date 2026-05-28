const mongoose = require("mongoose");
const Restaurant = require("../models/Restaurant");
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/ErrorResponse");
const sendTokenResponse = require("../utils/sendTokenResponse");
const redisClient = require("../config/redis");
const MenuItem = require("../models/Menu.js");
const OrderModel = require("../models/Order.js");
const Admin = require("../models/Admin");
const Notification = require("../models/NotificationModel");
const sendEmail = require("../utils/sendEmail");
const sendPushNotification = require("../utils/fcmHelper");
const ServiceRequest = require("../models/ServiceRequest");

// Register a new restaurant merchant account within the platform
exports.registerRestaurant = asyncHandler(async (req, res, next) => {
  const {
    restaurantName,
    ownerName,
    email,
    password,
    mobile,
    idType,
    idNumber,
  } = req.body;

  const exists = await Restaurant.findOne({ email });
  if (exists) {
    return next(new ErrorResponse("Restaurant already registered", 400));
  }

  let documentUrl = "";
  if (req.file) {
    documentUrl = req.file.path;
  }

  // Persist primary merchant registration entry into data cluster
  const restaurant = await Restaurant.create({
    restaurantName,
    ownerName,
    email,
    password,
    mobile,
    govtIdDetails: { idType, idNumber, documentUrl },
  });

  // Provide immediate response acknowledgement to the client application
  res.status(201).json({
    success: true,
    message: "Restaurant registered successfully. Wait for admin approval.",
  });

  try {
    const title = "New Restaurant Alert";
    const message = `${ownerName} just registered "${restaurantName}". Please review their profile.`;
    const type = "NEW_REGISTRATION";

    // Broadcast system notification payload to administrative desks
    await Notification.create({
      recipientModel: "Admin",
      title,
      message,
      type,
      relatedId: restaurant._id,
    });

    const admins = await Admin.find({});
    let adminTokens = [];
    let adminEmails = [];

    // Trigger fallback email transmission layer to administrative endpoints
    if (adminEmails.length > 0) {
      adminEmails.forEach((adminEmail) => {
        sendEmail({
          email: adminEmail,
          subject: title,
          message: message,
        });
      });
    }

    if (adminTokens.length > 0) {
      sendPushNotification(adminTokens, title, message, {
        type,
        restaurantId: restaurant._id.toString(),
      });
    }
  } catch (error) {
    console.error("Background Notification Error:", error);
  }
});

// Authenticate restaurant credentials and grant active session tokens
exports.loginRestaurant = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const restaurant = await Restaurant.findOne({ email }).select("+password");

  if (!restaurant) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  const isMatch = await restaurant.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  if (restaurant.status === "rejected" || restaurant.status === "suspended") {
    return next(new ErrorResponse("Account access denied", 403));
  }

  sendTokenResponse(restaurant, 200, res);
});

// Fetch restaurant specific merchant profile parameters from data layers
exports.getProfile = asyncHandler(async (req, res, next) => {
  const cacheKey = `restaurant_profile:${req.user.id}`;
  const cached = await redisClient.get(cacheKey);

  if (cached) {
    return res.status(200).json({
      success: true,
      source: "redis",
      data: JSON.parse(cached),
    });
  }

  const restaurant = await Restaurant.findById(req.user.id);

  if (!restaurant) {
    return next(new ErrorResponse("Restaurant not found", 404));
  }

  await redisClient.setEx(cacheKey, 3600, JSON.stringify(restaurant));

  res.status(200).json({
    success: true,
    source: "database",
    data: restaurant,
  });
});

// Update basic business structural variables inside merchant account state
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const { restaurantName, ownerName, mobile } = req.body;
  const restaurant = await Restaurant.findById(req.user.id);

  if (!restaurant) {
    return next(new ErrorResponse("Restaurant not found", 404));
  }

  restaurant.restaurantName = restaurantName || restaurant.restaurantName;
  restaurant.ownerName = ownerName || restaurant.ownerName;
  restaurant.mobile = mobile || restaurant.mobile;

  await restaurant.save();
  await redisClient.del(`restaurant_profile:${req.user.id}`);

  res.status(200).json({
    success: true,
    message: "Restaurant profile updated successfully",
    data: restaurant,
  });
});

// Append a fresh operational address matrix configuration block
exports.addAddress = asyncHandler(async (req, res, next) => {
  const restaurant = await Restaurant.findById(req.user.id);

  if (!restaurant) {
    return next(new ErrorResponse("Restaurant not found", 404));
  }

  if (!Array.isArray(restaurant.address)) {
    if (
      restaurant.address &&
      typeof restaurant.address === "object" &&
      Object.keys(restaurant.address).length > 0
    ) {
      restaurant.address = [restaurant.address];
    } else {
      restaurant.address = [];
    }
  }

  restaurant.address.push(req.body);
  await restaurant.save();
  await redisClient.del(`restaurant_profile:${req.user.id}`);

  res.status(201).json({
    success: true,
    message: "Address added successfully",
    data: restaurant.address,
  });
});

// Update attributes inside an existing localized address configuration namespace
exports.updateAddress = asyncHandler(async (req, res, next) => {
  const { addressId } = req.params;
  const restaurant = await Restaurant.findById(req.user.id);

  if (!restaurant) {
    return next(new ErrorResponse("Restaurant not found", 404));
  }

  if (!Array.isArray(restaurant.address)) {
    return next(new ErrorResponse("No addresses found to update", 404));
  }

  const address = restaurant.address.id(addressId);
  if (!address) {
    return next(new ErrorResponse("Address not found", 404));
  }

  Object.assign(address, req.body);
  await restaurant.save();
  await redisClient.del(`restaurant_profile:${req.user.id}`);

  res.status(200).json({
    success: true,
    message: "Address updated successfully",
    data: restaurant.address,
  });
});

// Delete localized geographical parameters from structural address arrays
exports.deleteAddress = asyncHandler(async (req, res, next) => {
  const { addressId } = req.params;
  const restaurant = await Restaurant.findById(req.user.id);

  if (!restaurant) {
    return next(new ErrorResponse("Restaurant not found", 404));
  }

  if (Array.isArray(restaurant.address)) {
    restaurant.address = restaurant.address.filter(
      (addr) => addr._id.toString() !== addressId,
    );
  } else {
    restaurant.address = [];
  }

  await restaurant.save();
  await redisClient.del(`restaurant_profile:${req.user.id}`);

  res.status(200).json({
    success: true,
    message: "Address deleted successfully",
  });
});

// Terminate session token cookies from active customer layout browsers
exports.logoutRestaurant = asyncHandler(async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    data: {},
    message: "Logged out successfully",
  });
});

// High performance cached data engine computing merchant telemetry statistics
exports.getDashboardStats = asyncHandler(async (req, res, next) => {
  const restaurantId = new mongoose.Types.ObjectId(req.user.id);
  const cacheKey = `dashboard_analytics:${req.user.id}`;

  try {
    // Intercept data mapping request from memory cache if trace identifiers exist
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        success: true,
        source: "redis",
        data: JSON.parse(cachedData),
      });
    }
  } catch (cacheErr) {
    console.error("Redis Cache Read Error:", cacheErr.message);
  }

  // Database operation pipeline executed if cache lookup misses data footprints

  // Menu Stats (Fast Counts)
  const [totalMenuItems, activeMenuItems] = await Promise.all([
    MenuItem.countDocuments({ restaurant: restaurantId, isDeleted: false }),
    MenuItem.countDocuments({
      restaurant: restaurantId,
      isDeleted: false,
      available: true,
    }),
  ]);
  const outOfStockItems = totalMenuItems - activeMenuItems;

  // Date Boundaries configuration
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const sevenDaysAgo = new Date(startOfToday);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  // Revenue Metrics Aggregation via database memory optimization pipelines
  const revenueStats = await OrderModel.aggregate([
    {
      $match: {
        restaurant: restaurantId,
        paymentStatus: { $regex: /^paid$/i },
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$totalPrice" },
        totalOrders: { $sum: 1 },
        todaysRevenue: {
          $sum: {
            $cond: [{ $gte: ["$createdAt", startOfToday] }, "$totalPrice", 0],
          },
        },
        thisMonthRevenue: {
          $sum: {
            $cond: [{ $gte: ["$createdAt", startOfMonth] }, "$totalPrice", 0],
          },
        },
        thisYearRevenue: {
          $sum: {
            $cond: [{ $gte: ["$createdAt", startOfYear] }, "$totalPrice", 0],
          },
        },
      },
    },
  ]);

  const stats = revenueStats[0] || {
    totalRevenue: 0,
    totalOrders: 0,
    todaysRevenue: 0,
    thisMonthRevenue: 0,
    thisYearRevenue: 0,
  };

  // Weekly Chart Data aggregation covering the last seven business calendar days
  const dailyRevenueRaw = await OrderModel.aggregate([
    {
      $match: {
        restaurant: restaurantId,
        paymentStatus: { $regex: /^paid$/i },
        createdAt: { $gte: sevenDaysAgo },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$createdAt",
            timezone: "Asia/Kolkata",
          },
        },
        revenue: { $sum: "$totalPrice" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
    const dayName = d.toLocaleDateString("en-US", {
      weekday: "short",
      timeZone: "Asia/Kolkata",
    });
    const found = dailyRevenueRaw.find((r) => r._id === dateStr);
    last7Days.push({ name: dayName, revenue: found ? found.revenue : 0 });
  }

  // Top Selling Items array aggregation tracking top consumer metrics
  const topItems = await OrderModel.aggregate([
    {
      $match: {
        restaurant: restaurantId,
        paymentStatus: { $regex: /^paid$/i },
      },
    },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.name",
        totalQuantity: { $sum: "$items.quantity" },
        revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
      },
    },
    { $sort: { totalQuantity: -1 } },
    { $limit: 5 },
  ]);

  const finalResponseData = {
    menuStats: { totalMenuItems, activeMenuItems, outOfStockItems },
    revenueStats: stats,
    weeklyChartData: last7Days,
    topSellingItems: topItems,
  };

  // Save telemetry dataset matrix to Redis cache expiring in one hour
  try {
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(finalResponseData));
  } catch (cacheSetErr) {
    console.error("Redis Cache Write Error:", cacheSetErr.message);
  }

  res.status(200).json({
    success: true,
    source: "database",
    data: finalResponseData,
  });
});

// Fetch non critical descriptive restaurant attributes for public portal cards
exports.getPublicRestaurantDetails = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const cacheKey = `public_restaurant_info:${id}`;

  const cached = await redisClient.get(cacheKey);

  if (cached) {
    return res.status(200).json({
      success: true,
      source: "redis",
      data: JSON.parse(cached),
    });
  }

  const restaurant = await Restaurant.findById(id).select(
    "restaurantName email -_id",
  );

  if (!restaurant) {
    return next(new ErrorResponse("Restaurant not found", 404));
  }

  await redisClient.setEx(cacheKey, 3600, JSON.stringify(restaurant));

  res.status(200).json({
    success: true,
    source: "database",
    data: restaurant,
  });
});

// Verify administrative verification state codes for property accounts
exports.checkRestaurantStatus = asyncHandler(async (req, res, next) => {
  const restaurant = await Restaurant.findById(req.user.id).select("status");

  if (!restaurant) {
    return next(new ErrorResponse("Restaurant not found", 404));
  }

  res.status(200).json({
    success: true,
    status: restaurant.status,
  });
});
