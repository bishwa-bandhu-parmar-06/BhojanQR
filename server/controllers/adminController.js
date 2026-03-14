const Admin = require("../models/Admin");
const Restaurant = require("../models/Restaurant");
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/ErrorResponse");
const sendTokenResponse = require("../utils/sendTokenResponse");
const redisClient = require("../config/redis");

// controller to register admin
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

// controller to login as admin
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

// controller to get admin profile
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

// controller to update admin profile
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

// controller to logout admin profile
exports.logoutAdmin = asyncHandler(async (req, res, next) => {
  if (req.user) {
    await redisClient.del(`admin_profile:${req.user.id}`);
  }

  res.clearCookie("token", {
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
});

// controller to get all pending restaurent
exports.getPendingRestaurants = asyncHandler(async (req, res, next) => {
  const restaurants = await Restaurant.find({ status: "pending" })
    .select("-password")
    .sort("-createdAt");

  res.status(200).json({
    success: true,
    count: restaurants.length,
    data: restaurants,
  });
});

// controlle to get all approved restaurent
exports.getApprovedRestaurants = asyncHandler(async (req, res, next) => {
  const restaurants = await Restaurant.find({ status: "approved" })
    .select("-password")
    .sort("-createdAt");

  res.status(200).json({
    success: true,
    count: restaurants.length,
    data: restaurants,
  });
});

// controller to get all rejected restaurent
exports.getRejectedRestaurants = asyncHandler(async (req, res, next) => {
  const restaurants = await Restaurant.find({ status: "rejected" })
    .select("-password")
    .sort("-createdAt");

  res.status(200).json({
    success: true,
    count: restaurants.length,
    data: restaurants,
  });
});

// controller to approve the restaurent
exports.approveRestaurant = asyncHandler(async (req, res, next) => {
  const restaurant = await Restaurant.findById(req.params.id);

  if (!restaurant) {
    return next(new ErrorResponse("Restaurant not found", 404));
  }

  restaurant.status = "approved";
  await restaurant.save();

  await redisClient.del(`restaurant_profile:${req.params.id}`);

  res.status(200).json({
    success: true,
    message: "Restaurant approved successfully",
    data: restaurant,
  });
});

// controller to reject the resturent
exports.rejectRestaurant = asyncHandler(async (req, res, next) => {
  const restaurant = await Restaurant.findById(req.params.id);

  if (!restaurant) {
    return next(new ErrorResponse("Restaurant not found", 404));
  }

  restaurant.status = "rejected";
  await restaurant.save();

  await redisClient.del(`restaurant_profile:${req.params.id}`);

  res.status(200).json({
    success: true,
    message: "Restaurant rejected",
    data: restaurant,
  });
});

// controller to get admin email only
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
