const { check, validationResult } = require("express-validator");
const ErrorResponse = require("../utils/ErrorResponse");

const runValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ErrorResponse(errors.array()[0].msg, 400));
  }
  next();
};

exports.validateRestaurantRegister = [
  check("restaurantName", "Restaurant name is required").notEmpty().trim(),
  check("ownerName", "Owner name is required").notEmpty().trim(),
  check("email", "Please include a valid email").isEmail().normalizeEmail(),
  check("password", "Password must be 8 or more characters").isLength({
    min: 8,
  }),
  check("mobile", "Please enter a valid 10-digit mobile number").matches(
    /^[6-9]\d{9}$/,
  ),

  check("idType", "Valid Govt ID Type is required").isIn([
    "FSSAI",
    "GSTIN",
    "PAN",
    "Aadhar",
  ]),
  check("idNumber", "Govt ID Number is required").notEmpty().trim(),

  runValidation,
];

exports.validateRestaurantLogin = [
  check("email", "Please include a valid email").isEmail().normalizeEmail(),
  check("password", "Password is required").notEmpty(),
  runValidation,
];
// Add this to your restaurantValidator.js file
exports.validateProfileUpdate = [
  check("restaurantName", "Restaurant name cannot be empty")
    .optional()
    .notEmpty()
    .trim(),
  check("ownerName", "Owner name cannot be empty").optional().notEmpty().trim(),
  check("mobile", "Please enter a valid 10-digit mobile number")
    .optional()
    .matches(/^[6-9]\d{9}$/),

  // Address validations
  check("address.street", "Street address is required when updating address")
    .optional()
    .notEmpty(),
  check("address.city", "City is required when updating address")
    .optional()
    .notEmpty(),
  check("address.state", "State is required when updating address")
    .optional()
    .notEmpty(),
  check("address.pincode", "Valid 6-digit Pincode is required")
    .optional()
    .matches(/^[1-9][0-9]{5}$/),

  runValidation,
];
