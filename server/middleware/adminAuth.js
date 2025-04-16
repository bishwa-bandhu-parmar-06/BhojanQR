const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    // ✅ 1. Extracting the Authorization header
    const authHeader = req.headers.authorization;

    // ✅ 2. Checking if it exists and starts with 'Bearer '
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Access denied, no token provided" });
    }

    // ✅ 3. Extracting the actual token (after 'Bearer ')
    const token = authHeader.split(" ")[1];

    // ✅ 4. Verifying token using secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ 5. Storing decoded token (admin info) in req object
    req.admin = decoded;

    // ✅ 6. Calling next() to continue
    next();
  } catch (error) {
    // ❌ If token is invalid or expired
    res.status(403).json({ message: "Invalid token", error: error.message });
  }
};
