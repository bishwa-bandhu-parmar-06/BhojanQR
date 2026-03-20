// controllers/qrController.js
const QRCodeModel = require("../models/QRCode");
const QRCodeLib = require("qrcode");
const { cloudinary } = require("../config/cloudinary");
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/ErrorResponse");

// exports.generateAndSaveQRs = asyncHandler(async (req, res, next) => {
//   const { tableNumbers } = req.body;
//   const restaurantId = req.user.id;

//   const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

//   if (!tableNumbers || !Array.isArray(tableNumbers)) {
//     return next(
//       new ErrorResponse("Please provide an array of table numbers", 400),
//     );
//   }

//   const generatedQRs = [];

//   for (const tableNumber of tableNumbers) {
//     let existingQR = await QRCodeModel.findOne({
//       restaurant: restaurantId,
//       tableNumber,
//     });

//     if (existingQR) {
//       generatedQRs.push(existingQR);
//       continue;
//     }

//     // 2. Generate QR Code Image Data URI
//     const scanUrl = `${FRONTEND_URL}/menu/${restaurantId}?table=${tableNumber}`;
//     const qrDataURI = await QRCodeLib.toDataURL(scanUrl, {
//       width: 400,
//       margin: 2,
//       color: { dark: "#000000", light: "#ffffff" },
//     });

//     // 3. Upload directly to Cloudinary
//     const uploadResponse = await cloudinary.uploader.upload(qrDataURI, {
//       folder: `bhojanqr-qrcodes/${restaurantId}`,
//     });

//     // 4. Save to Database
//     const newQR = await QRCodeModel.create({
//       restaurant: restaurantId,
//       tableNumber,
//       qrImageUrl: uploadResponse.secure_url,
//       scanUrl,
//     });

//     generatedQRs.push(newQR);
//   }

//   res.status(201).json({
//     success: true,
//     data: generatedQRs,
//   });
// });

exports.generateAndSaveQRs = asyncHandler(async (req, res, next) => {
  const { tableNumbers } = req.body;
  const restaurantId = req.user.id;

  //  DYNAMIC URL FIX
  // req.protocol gets 'http' or 'https'
  // req.get("host") gets 'localhost:3000' or your production domain name
  const FRONTEND_URL = `${req.protocol}://${req.get("host")}`;

  // Input Validation
  if (
    !tableNumbers ||
    !Array.isArray(tableNumbers) ||
    tableNumbers.length === 0
  ) {
    return next(
      new ErrorResponse("Please provide an array of table numbers", 400),
    );
  }

  // 2. Bulk Database Lookup (MASSIVE Performance Boost)
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

  // 3. Parallel Processing for Generation & Upload
  const uploadPromises = tablesToGenerate.map(async (tableNumber) => {
    // It will automatically use the correct domain here!
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

  const allRequestedQRs = [...existingQRs, ...newlyCreatedQRs].sort(
    (a, b) => a.tableNumber - b.tableNumber,
  );

  res.status(201).json({ success: true, data: allRequestedQRs });
});

exports.getSavedQRs = asyncHandler(async (req, res, next) => {
  const qrs = await QRCodeModel.find({ restaurant: req.user.id }).sort({
    tableNumber: 1,
  });

  res.status(200).json({
    success: true,
    count: qrs.length,
    data: qrs,
  });
});

exports.deleteQR = asyncHandler(async (req, res, next) => {
  const qr = await QRCodeModel.findOne({
    _id: req.params.id,
    restaurant: req.user.id,
  });

  if (!qr) {
    return next(new ErrorResponse("QR Code not found", 404));
  }

  // Delete from Cloudinary
  const urlParts = qr.qrImageUrl.split("/");
  const publicId = `bhojanqr-qrcodes/${req.user.id}/${urlParts[urlParts.length - 1].split(".")[0]}`;
  await cloudinary.uploader
    .destroy(publicId)
    .catch((err) => console.error("Cloudinary Del Error:", err));

  // Delete from DB
  await qr.deleteOne();

  res.status(200).json({
    success: true,
    message: "QR Code deleted successfully",
  });
});
