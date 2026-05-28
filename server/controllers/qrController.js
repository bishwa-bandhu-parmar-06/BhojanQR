const QRCodeModel = require("../models/QRCode");
const QRCodeLib = require("qrcode");
const { cloudinary } = require("../config/cloudinary");
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/ErrorResponse");
const redisClient = require("../config/redis");

// Generate and save quick response codes using batch processing architectures
exports.generateAndSaveQRs = asyncHandler(async (req, res, next) => {
  const { tableNumbers } = req.body;
  const restaurantId = req.user.id;
  const FRONTEND_URL = `${req.protocol}://${req.get("host")}`;

  if (
    !tableNumbers ||
    !Array.isArray(tableNumbers) ||
    tableNumbers.length === 0
  ) {
    return next(
      new ErrorResponse("Please provide an array of table numbers", 400),
    );
  }

  const existingQRs = await QRCodeModel.find({
    restaurant: restaurantId,
    tableNumber: { $in: tableNumbers },
  });

  const existingTableNumbers = new Set(existingQRs.map((qr) => qr.tableNumber));
  const tablesToGenerate = tableNumbers.filter(
    (num) => !existingTableNumbers.has(num),
  );

  if (tablesToGenerate.length === 0) {
    return res.status(200).json({ success: true, data: existingQRs });
  }

  const uploadPromises = tablesToGenerate.map(async (tableNumber) => {
    const scanUrl = `${FRONTEND_URL}/menu/${restaurantId}?table=${tableNumber}`;

    const qrDataURI = await QRCodeLib.toDataURL(scanUrl, {
      width: 400,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    });

    const uploadResponse = await cloudinary.uploader.upload(qrDataURI, {
      folder: `bhojanqr-qrcodes/${restaurantId}`,
    });

    return {
      restaurant: restaurantId,
      tableNumber,
      qrImageUrl: uploadResponse.secure_url,
      scanUrl,
    };
  });

  const newQRData = await Promise.all(uploadPromises);
  const newlyCreatedQRs = await QRCodeModel.insertMany(newQRData);

  // Invalidation Lock: Remove historical listings and clean validation maps for new entries
  try {
    await redisClient.del(`qr:list:${restaurantId}`);
    const clearValidations = tablesToGenerate.map((num) =>
      redisClient.del(`qr:validate:${restaurantId}:${num}`),
    );
    await Promise.all(clearValidations);
  } catch (cacheErr) {
    console.error("Redis Cache Invalidation Error:", cacheErr.message);
  }

  const allRequestedQRs = [...existingQRs, ...newlyCreatedQRs].sort(
    (a, b) => a.tableNumber - b.tableNumber,
  );

  res.status(201).json({ success: true, data: allRequestedQRs });
});

// Fetch saved matrix configurations belonging to property manager with memory optimization
exports.getSavedQRs = asyncHandler(async (req, res, next) => {
  const cacheKey = `qr:list:${req.user.id}`;

  try {
    // Intercept data mapping request from cache layer if dataset matches signature
    const cachedQRs = await redisClient.get(cacheKey);
    if (cachedQRs) {
      const data = JSON.parse(cachedQRs);
      return res.status(200).json({
        success: true,
        source: "redis",
        count: data.length,
        data: data,
      });
    }
  } catch (cacheErr) {
    console.error("Redis Cache Read Error:", cacheErr.message);
  }

  const qrs = await QRCodeModel.find({ restaurant: req.user.id }).sort({
    tableNumber: 1,
  });

  try {
    // Store array values inside server storage cache configuration for one hour
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(qrs));
  } catch (cacheSetErr) {
    console.error("Redis Cache Write Error:", cacheSetErr.message);
  }

  res.status(200).json({
    success: true,
    source: "database",
    count: qrs.length,
    data: qrs,
  });
});

// Delete specific configuration instance from cloud hosting buckets and active clusters
exports.deleteQR = asyncHandler(async (req, res, next) => {
  const qr = await QRCodeModel.findOne({
    _id: req.params.id,
    restaurant: req.user.id,
  });

  if (!qr) {
    return next(new ErrorResponse("QR Code not found", 404));
  }

  const urlParts = qr.qrImageUrl.split("/");
  const publicId = `bhojanqr-qrcodes/${req.user.id}/${urlParts[urlParts.length - 1].split(".")[0]}`;

  await cloudinary.uploader
    .destroy(publicId)
    .catch((err) => console.error("Cloudinary Asset Disposal Failure:", err));

  await qr.deleteOne();

  // Invalidation Lock: Purge specific table verification flags and main inventory lookup cache
  try {
    await redisClient.del(`qr:list:${req.user.id}`);
    await redisClient.del(`qr:validate:${req.user.id}:${qr.tableNumber}`);
  } catch (cacheErr) {
    console.error("Redis Cache Invalidation Error:", cacheErr.message);
  }

  res.status(200).json({
    success: true,
    message: "QR Code deleted successfully",
  });
});

// Enforce real time validation rules for client devices pointing to physical assets
exports.validateTableNumber = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { table } = req.query;

  if (!table) {
    return next(new ErrorResponse("Table number is required", 400));
  }

  const cacheKey = `qr:validate:${id}:${table}`;

  try {
    // Read state parameters directly from key values to mitigate high concurrent lookup delays
    const cachedValidation = await redisClient.get(cacheKey);
    if (cachedValidation) {
      return res.status(200).json({
        success: true,
        source: "redis",
        ...JSON.parse(cachedValidation),
      });
    }
  } catch (cacheErr) {
    console.error("Redis Cache Read Error:", cacheErr.message);
  }

  const existingQR = await QRCodeModel.findOne({
    restaurant: id,
    tableNumber: Number(table),
  });

  const responseData = {
    isValid: existingQR ? true : false,
  };

  if (!existingQR) {
    responseData.message =
      "Invalid Table! This table QR code does not exist or has been deleted.";
  }

  try {
    // Keep validation metrics cached for two hours to handle recurring scan behaviors elegantly
    await redisClient.setEx(cacheKey, 7200, JSON.stringify(responseData));
  } catch (cacheSetErr) {
    console.error("Redis Cache Write Error:", cacheSetErr.message);
  }

  res.status(200).json({
    success: true,
    source: "database",
    ...responseData,
  });
});
