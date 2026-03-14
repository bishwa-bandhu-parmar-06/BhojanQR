const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const ErrorResponse = require("../utils/ErrorResponse");
const Admin = require("../models/Admin");
const Restaurant = require("../models/Restaurant");

// ==========================================
// 1. AUTHENTICATION (Who are you?)
// ==========================================
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Extract Token from Authorization Header or Cookie
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  // 2. Make sure token exists
  if (!token) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }

  try {
    // 3. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Determine user role based on token payload and fetch from DB
    // NOTE: Ensure your Admin login also includes { role: 'admin' } in its JWT payload!
    if (decoded.role === "admin") {
      req.user = await Admin.findById(decoded.id).select("-password -otp");
      req.userRole = "admin";
    } else if (decoded.role === "restaurant") {
      req.user = await Restaurant.findById(decoded.id).select("-password");
      req.userRole = "restaurant";
    }

    // 5. Check if user still exists in DB (in case they were deleted but token is still valid)
    if (!req.user) {
      return next(
        new ErrorResponse(
          "The user belonging to this token no longer exists.",
          401,
        ),
      );
    }

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    return next(
      new ErrorResponse(
        "Not authorized to access this route - Invalid Token",
        401,
      ),
    );
  }
});

// ==========================================
// 2. AUTHORIZATION (What are you allowed to do?)
// ==========================================
// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return next(
        new ErrorResponse(
          `User role '${req.userRole}' is not authorized to access this route`,
          403, // 403 Forbidden
        ),
      );
    }
    next();
  };
};
