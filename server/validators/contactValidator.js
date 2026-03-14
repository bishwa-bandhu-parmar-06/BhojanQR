const { check, validationResult } = require("express-validator");
const ErrorResponse = require("../utils/ErrorResponse");

const runValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return next(new ErrorResponse(errors.array()[0].msg, 400));
  next();
};

exports.validateContactForm = [
  check("name", "Name is required").notEmpty().trim(),
  check("email", "Valid email is required").isEmail().normalizeEmail(),
  check("mobile", "Mobile number is required").notEmpty(),
  check("message", "Message is required").notEmpty().isLength({ max: 2000 }),
  runValidation,
];
