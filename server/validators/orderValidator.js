const { check, validationResult } = require("express-validator");
const ErrorResponse = require("../../utils/ErrorResponse");

const runValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return next(new ErrorResponse(errors.array()[0].msg, 400));
  next();
};

exports.validateCreateOrder = [
  check("restaurantId", "Restaurant ID is required").isMongoId(),
  check("customerName", "Customer name is required").notEmpty().trim(),
  check("tableNumber", "Table number is required").isNumeric(),
  check(
    "totalPrice",
    "Total price is required and must be a number",
  ).isNumeric(),
  check("items", "Order must contain items").isArray({ min: 1 }),
  check("items.*.menuItem", "Invalid menu item ID").isMongoId(),
  check("items.*.quantity", "Quantity must be at least 1").isInt({ min: 1 }),
  runValidation,
];

exports.validateOrderStatusUpdate = [
  check("status", "Invalid status").isIn(["Pending", "Preparing", "Completed"]),
  runValidation,
];

exports.validatePaymentVerification = [
  check("razorpay_order_id", "Razorpay Order ID is required").notEmpty(),
  check("razorpay_payment_id", "Razorpay Payment ID is required").notEmpty(),
  check("razorpay_signature", "Signature is required").notEmpty(),
  check("orderDBId", "Database Order ID is required").isMongoId(),
  runValidation,
];
