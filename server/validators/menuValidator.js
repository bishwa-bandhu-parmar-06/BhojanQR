const { check, validationResult } = require("express-validator");
const ErrorResponse = require("../utils/ErrorResponse.js");

const runValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return next(new ErrorResponse(errors.array()[0].msg, 400));
  next();
};

exports.validateMenuItem = [
  check("name", "Menu item name is required").notEmpty().trim(),
  check("price", "Price must be a positive number").isFloat({ min: 0 }),
  check("category", "Invalid category").isIn([
    "Main Course",
    "Starter",
    "Dessert",
    "Beverage",
  ]),
  runValidation,
];
