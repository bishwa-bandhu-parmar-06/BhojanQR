const ErrorResponse = require("../utils/ErrorResponse");

// 1. Catch 404 Not Found errors
const notFound = (req, res, next) => {
  const error = new ErrorResponse(`Not Found - ${req.originalUrl}`, 404);
  next(error); // Passes the error down to the errorHandler below
};

// 2. Centralized Error Handler
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for developer (optional, good for debugging)
  console.error("🔴 Backend Error Details: ", err.message || err);
  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = `Resource not found with id of ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = "Duplicate field value entered";
    error = new ErrorResponse(message, 400);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    error = new ErrorResponse(message, 400);
  }

  // Send the final response
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Server Error",
  });
};

// Export BOTH functions as an object
module.exports = { errorHandler, notFound };
