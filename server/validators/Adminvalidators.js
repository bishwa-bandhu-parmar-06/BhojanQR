const { check, validationResult } = require("express-validator");
const ErrorResponse = require("../utils/ErrorResponse");

const runValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ErrorResponse(errors.array()[0].msg, 400));
  }
  next();
};

exports.validateAdminRegister = [
  check("name", "Name is required").notEmpty().trim(),
  check("email", "Valid email is required").isEmail().normalizeEmail(),
  check("password", "Password must be at least 8 characters").isLength({
    min: 8,
  }),
  check("mobile", "Valid mobile number is required").matches(/^[6-9]\d{9}$/),
  runValidation,
];

exports.validateAdminLogin = [
  check("email", "Valid email is required").isEmail().normalizeEmail(),
  check("password", "Password is required").notEmpty(),
  runValidation,
];
