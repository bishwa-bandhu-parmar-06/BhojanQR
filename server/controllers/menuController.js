const MenuItem = require("../models/Menu.js");
const ErrorResponse = require("../utils/ErrorResponse");
const asyncHandler = require("../middleware/asyncHandler");
const { cloudinary } = require("../config/cloudinary");
const redisClient = require("../config/redis");

// ==========================================
// CACHE HELPERS
// ==========================================
const getPublicMenuKey = (id) => `menu:public:${id}`;
const getOwnerMenuKey = (id) => `menu:owner:${id}`;

// ==========================================
// UPDATED CACHE HELPER
// ==========================================
const clearMenuCache = async (restaurantId) => {
  try {
    //  Wildcard (*) lagaya hai taaki page 1, 2, 3 saare cache ek sath delete hon
    const publicKeys = await redisClient.keys(`menu:public:${restaurantId}*`);
    const ownerKeys = await redisClient.keys(`menu:owner:${restaurantId}*`);
    const allKeys = await redisClient.keys("menu:all:*");

    const keysToDelete = [...publicKeys, ...ownerKeys, ...allKeys];

    if (keysToDelete.length > 0) {
      await redisClient.del(keysToDelete);
    }
  } catch (error) {
    console.error("[Redis Cache Clear Error]:", error.message);
  }
};

// Helper function to extract Cloudinary public_id from URL for deletion
const extractPublicId = (url) => {
  try {
    const parts = url.split("/");
    const filenameWithExt = parts.pop();
    const folder = parts.pop();
    const filename = filenameWithExt.split(".")[0];
    return `${folder}/${filename}`;
  } catch (error) {
    console.error(
      "[Menu Controller | Helper] Error extracting public ID:",
      error.message,
    );
    return null;
  }
};

// ==========================================
// CONTROLLERS
// ==========================================

exports.addMenuItem = asyncHandler(async (req, res, next) => {
  const { name, price, category, description, available } = req.body;
  const restaurantId = req.user._id;

  if (!req.file) {
    return next(
      new ErrorResponse("Please upload an image for the menu item", 400),
    );
  }

  try {
    const newMenuItem = await MenuItem.create({
      restaurant: restaurantId,
      name,
      price,
      category,
      description,
      imageUrl: req.file.path,
      // FormData sends strings, so we must parse it carefully
      available: available === "false" ? false : true,
    });

    await clearMenuCache(restaurantId);

    res.status(201).json({
      success: true,
      data: newMenuItem,
    });
  } catch (error) {
    console.error("[Menu Controller | addMenuItem] DB Creation Error:", error);
    return next(new ErrorResponse("Failed to create menu item", 500));
  }
});

// ==========================================
// UPDATED CONTROLLERS (Optional Pagination)
// ==========================================

exports.getMyMenu = asyncHandler(async (req, res, next) => {
  const restaurantId = req.user._id;
  const page = req.query.page ? parseInt(req.query.page) : null;
  const limit = req.query.limit ? parseInt(req.query.limit) : null;

  // Cache key dynamic banayi
  const cacheKey =
    page && limit
      ? `menu:owner:${restaurantId}:page:${page}:limit:${limit}`
      : `menu:owner:${restaurantId}`;

  const cachedMenu = await redisClient.get(cacheKey);
  if (cachedMenu) {
    return res.status(200).json({
      success: true,
      source: "redis",
      count: JSON.parse(cachedMenu).length,
      data: JSON.parse(cachedMenu),
    });
  }

  // Base Query
  let query = MenuItem.find({
    restaurant: restaurantId,
    isDeleted: false,
  }).sort("-createdAt");

  //  Agar page aur limit aayi hai tabhi Skip aur Limit lagao
  if (page && limit) {
    query = query.skip((page - 1) * limit).limit(limit);
  }

  const menuItems = await query;
  await redisClient.setEx(cacheKey, 3600, JSON.stringify(menuItems));

  res.status(200).json({
    success: true,
    source: "database",
    count: menuItems.length,
    data: menuItems,
  });
});

exports.getPublicMenu = asyncHandler(async (req, res, next) => {
  const { restaurantId } = req.params;
  const page = req.query.page ? parseInt(req.query.page) : null;
  const limit = req.query.limit ? parseInt(req.query.limit) : null;

  const cacheKey =
    page && limit
      ? `menu:public:${restaurantId}:page:${page}:limit:${limit}`
      : `menu:public:${restaurantId}`;

  try {
    const cachedMenu = await redisClient.get(cacheKey);
    if (cachedMenu)
      return res
        .status(200)
        .json({ success: true, source: "redis", data: JSON.parse(cachedMenu) });

    let query = MenuItem.find({
      restaurant: restaurantId,
      available: true,
      isDeleted: false,
    }).populate("restaurant", "restaurantName");

    //  Optional Pagination
    if (page && limit) {
      query = query.skip((page - 1) * limit).limit(limit);
    }

    const menuItems = await query;

    if (!menuItems)
      return next(new ErrorResponse("Menu not found for this restaurant", 404));

    await redisClient.setEx(cacheKey, 3600, JSON.stringify(menuItems));
    res.status(200).json({
      success: true,
      source: "database",
      count: menuItems.length,
      data: menuItems,
    });
  } catch (error) {
    next(error);
  }
});

exports.getAllMenuItems = asyncHandler(async (req, res, next) => {
  const page = req.query.page ? parseInt(req.query.page) : null;
  const limit = req.query.limit ? parseInt(req.query.limit) : null;

  const cacheKey =
    page && limit ? `menu:all:page:${page}:limit:${limit}` : `menu:all:full`; // Agar website se call aayi toh 'full' cache use hoga

  const cachedAllMenu = await redisClient.get(cacheKey);
  if (cachedAllMenu) {
    return res.status(200).json({
      success: true,
      source: "redis",
      data: JSON.parse(cachedAllMenu),
    });
  }

  let query = MenuItem.find({ isDeleted: false })
    .populate("restaurant", "restaurantName")
    .sort({ createdAt: -1 });

  //  Optional Pagination (Website ka data break nahi hoga)
  if (page && limit) {
    query = query.skip((page - 1) * limit).limit(limit);
  }

  const menuItems = await query;
  await redisClient.setEx(cacheKey, 3600, JSON.stringify(menuItems));

  res.status(200).json({ success: true, source: "database", data: menuItems });
});
exports.updateMenuItem = asyncHandler(async (req, res, next) => {
  const itemId = req.params.id;

  let menuItem = await MenuItem.findOne({
    _id: itemId,
    restaurant: req.user._id,
    isDeleted: false,
  });

  if (!menuItem) {
    return next(new ErrorResponse("Menu item not found or unauthorized", 404));
  }

  // Handle new image upload
  if (req.file) {
    const oldPublicId = extractPublicId(menuItem.imageUrl);
    if (oldPublicId) {
      await cloudinary.uploader.destroy(oldPublicId).catch((err) => {
        console.error(`[Menu Controller] Cloudinary Deletion Error:`, err);
      });
    }
    req.body.imageUrl = req.file.path;
  }

  // Handle FormData boolean conversion
  if (req.body.available !== undefined) {
    req.body.available = req.body.available === "false" ? false : true;
  }

  menuItem = await MenuItem.findByIdAndUpdate(itemId, req.body, {
    new: true,
    runValidators: true,
  });

  await clearMenuCache(req.user._id);

  res.status(200).json({
    success: true,
    data: menuItem,
  });
});

exports.updateMenuAvailability = asyncHandler(async (req, res, next) => {
  const itemId = req.params.id;

  const menuItem = await MenuItem.findOne({
    _id: itemId,
    restaurant: req.user._id,
    isDeleted: false,
  });

  if (!menuItem) {
    return next(new ErrorResponse("Menu item not found", 404));
  }

  menuItem.available = !menuItem.available;
  await menuItem.save();

  await clearMenuCache(req.user._id);

  res.status(200).json({
    success: true,
    data: menuItem,
  });
});

exports.deleteMenuItem = asyncHandler(async (req, res, next) => {
  const itemId = req.params.id;

  const menuItem = await MenuItem.findOne({
    _id: itemId,
    restaurant: req.user._id,
  });

  if (!menuItem) {
    return next(new ErrorResponse("Menu item not found", 404));
  }

  menuItem.isDeleted = true;
  menuItem.available = false;
  await menuItem.save();

  await clearMenuCache(req.user._id);

  res.status(200).json({
    success: true,
    message: "Menu item successfully deleted",
  });
});
