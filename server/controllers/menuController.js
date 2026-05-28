const MenuItem = require("../models/Menu.js");
const ErrorResponse = require("../utils/ErrorResponse");
const asyncHandler = require("../middleware/asyncHandler");
const { cloudinary } = require("../config/cloudinary");
const redisClient = require("../config/redis");

// Core naming structures for dynamic memory cache namespaces
const getPublicMenuKey = (id) => `menu:public:${id}`;
const getOwnerMenuKey = (id) => `menu:owner:${id}`;

// Centralised function to clear all variations of menu caches including pagination sets
const clearMenuCache = async (restaurantId) => {
  try {
    // Lookup matching query patterns to collect paginated or non paginated keys
    const publicKeys = await redisClient.keys(`menu:public:${restaurantId}*`);
    const ownerKeys = await redisClient.keys(`menu:owner:${restaurantId}*`);
    const allKeys = await redisClient.keys("menu:all:*");

    // Invalidate chatbot assistant memory map to keep virtual waiter synchronized
    const chatKey = `chat_menu_data:${restaurantId}`;

    const keysToDelete = [...publicKeys, ...ownerKeys, ...allKeys, chatKey];

    if (keysToDelete.length > 0) {
      await redisClient.del(keysToDelete);
    }
  } catch (error) {
    console.error("Redis Cache Clear Error:", error.message);
  }
};

// Extraction parser to separate the media asset storage reference from absolute url
const extractPublicId = (url) => {
  try {
    const parts = url.split("/");
    const filenameWithExt = parts.pop();
    const folder = parts.pop();
    const filename = filenameWithExt.split(".")[0];
    return `${folder}/${filename}`;
  } catch (error) {
    console.error(
      "Error extracting media cloud asset public ID:",
      error.message,
    );
    return null;
  }
};

// Add a fresh recipe or food record to the restaurant inventory
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
      // String validation fallback since multi part form data delivers standard text tokens
      available: available === "false" ? false : true,
    });

    // Flush existing records to enforce structural consistency across connected screens
    await clearMenuCache(restaurantId);

    res.status(201).json({
      success: true,
      data: newMenuItem,
    });
  } catch (error) {
    console.error("Database persistence failure during item insertion:", error);
    return next(new ErrorResponse("Failed to create menu item", 500));
  }
});

// Fetch inventory logs belonging explicitly to authenticated property manager
exports.getMyMenu = asyncHandler(async (req, res, next) => {
  const restaurantId = req.user._id;
  const page = req.query.page ? parseInt(req.query.page) : null;
  const limit = req.query.limit ? parseInt(req.query.limit) : null;

  // Compute dynamic cache footprint matching client signature specifications
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

  let query = MenuItem.find({
    restaurant: restaurantId,
    isDeleted: false,
  }).sort("-createdAt");

  // Apply cursor controls only if pagination parameters are explicitly delivered
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

// Serve public customer facing inventory catalog filtered by store visibility
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
    if (cachedMenu) {
      return res.status(200).json({
        success: true,
        source: "redis",
        data: JSON.parse(cachedMenu),
      });
    }

    let query = MenuItem.find({
      restaurant: restaurantId,
      available: true,
      isDeleted: false,
    }).populate("restaurant", "restaurantName");

    if (page && limit) {
      query = query.skip((page - 1) * limit).limit(limit);
    }

    const menuItems = await query;

    if (!menuItems) {
      return next(new ErrorResponse("Menu not found for this restaurant", 404));
    }

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

// Global extraction endpoint primarily consumed by index aggregators or root system portals
exports.getAllMenuItems = asyncHandler(async (req, res, next) => {
  const page = req.query.page ? parseInt(req.query.page) : null;
  const limit = req.query.limit ? parseInt(req.query.limit) : null;

  const cacheKey =
    page && limit ? `menu:all:page:${page}:limit:${limit}` : `menu:all:full`;

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

  if (page && limit) {
    query = query.skip((page - 1) * limit).limit(limit);
  }

  const menuItems = await query;
  await redisClient.setEx(cacheKey, 3600, JSON.stringify(menuItems));

  res.status(200).json({
    success: true,
    source: "database",
    data: menuItems,
  });
});

// Modify existing structural attributes or replace inventory details
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

  // Intercept new media files to securely replace reference identifiers on cloud servers
  if (req.file) {
    const oldPublicId = extractPublicId(menuItem.imageUrl);
    if (oldPublicId) {
      await cloudinary.uploader.destroy(oldPublicId).catch((err) => {
        console.error("Media server cloud removal failure:", err);
      });
    }
    req.body.imageUrl = req.file.path;
  }

  if (req.body.available !== undefined) {
    req.body.available = req.body.available === "false" ? false : true;
  }

  menuItem = await MenuItem.findByIdAndUpdate(itemId, req.body, {
    new: true,
    runValidators: true,
  });

  // Purge data configurations from caching namespaces to prevent staleness
  await clearMenuCache(req.user._id);

  res.status(200).json({
    success: true,
    data: menuItem,
  });
});

// Flip stock variables dynamically from kitchen monitor shortcuts
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

// Execute safe logical exclusion parameters instead of running destructive database deletes
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
