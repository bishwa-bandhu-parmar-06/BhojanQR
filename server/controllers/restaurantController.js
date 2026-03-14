const Restaurant = require("../models/Restaurant");
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/ErrorResponse");
const sendTokenResponse = require("../utils/sendTokenResponse");
const redisClient = require("../config/redis");
const MenuItem = require("../models/Menu.js");
const OrderModel = require("../models/Order.js")
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

  const restaurant = await Restaurant.create({
    restaurantName,
    ownerName,
    email,
    password,
    mobile,
    govtIdDetails: {
      idType,
      idNumber,
      documentUrl,
    },
  });

  res.status(201).json({
    success: true,
    message: "Restaurant registered successfully. Wait for admin approval.",
  });
});
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

  if (restaurant.status === "pending") {
    return next(new ErrorResponse("Account pending admin approval", 403));
  }

  if (restaurant.status === "rejected" || restaurant.status === "suspended") {
    return next(new ErrorResponse("Account access denied", 403));
  }

  sendTokenResponse(restaurant, 200, res);
});

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

// Update Basic Profile Info
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

// Add New Address
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

// Update Existing Address
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

// Delete Address
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

exports.logoutRestaurant = asyncHandler(async (req, res, next) => {
  if (req.user) {
    await redisClient.del(`restaurant_profile:${req.user.id}`);
  }

  res.clearCookie("token", { httpOnly: true });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

exports.getDashboardStats = asyncHandler(async (req, res, next) => {
  const restaurantId = req.user.id;

  const totalMenuItems = await MenuItem.countDocuments({
    restaurant: restaurantId,
    isDeleted: false,
  });

  const activeMenuItems = await MenuItem.countDocuments({
    restaurant: restaurantId,
    isDeleted: false,
    available: true,
  });

  const outOfStockItems = totalMenuItems - activeMenuItems;

  const totalOrders = await OrderModel.countDocuments({ restaurant: restaurantId });

  res.status(200).json({
    success: true,
    data: {
      totalMenuItems,
      activeMenuItems,
      outOfStockItems,
      totalOrders,
      totalRevenue: 0,
    },
  });
});
// controller to get name and email with id 
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
