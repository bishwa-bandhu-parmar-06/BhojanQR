require("dotenv").config();

const express = require("express");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");
const rateLimit = require("express-rate-limit");
const compression = require("compression");
const morgan = require("morgan");

const connectDb = require("./config/dataBase");
const { errorHandler, notFound } = require("./middleware/errorHandler");

const adminRoutes = require("./routes/adminRoutes");
const menuRoutes = require("./routes/menuRoutes");
const contactRoutes = require("./routes/contactRoutes");
const orderRoutes = require("./routes/orderRoutes");
const restaurantRoutes = require("./routes/restaurantRoutes");
const configRoutes = require("./routes/configRoutes");
const app = express();
const PORT = process.env.PORT || 3000;
const rootDir = path.resolve();

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

connectDb();

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "img-src": ["'self'", "data:", "blob:", "https://res.cloudinary.com"],
        "script-src": [
          "'self'",
          "'unsafe-inline'", // Required by React/Vite
          "https://checkout.razorpay.com",
        ],
        "style-src": [
          "'self'",
          "'unsafe-inline'", // Required for Tailwind/CSS-in-JS
        ],
        "frame-src": [
          "'self'",
          "https://api.razorpay.com",
          "https://checkout.razorpay.com",
        ],
        "connect-src": [
          "'self'",
          "https://api.razorpay.com",
          "https://checkout.razorpay.com",
        ],
      },
    },
  }),
);
// app.use(
//   helmet({
//     crossOriginResourcePolicy: false,
//     contentSecurityPolicy: {
//       useDefaults: true,
//       directives: {
//         "img-src": ["'self'", "data:", "https://res.cloudinary.com"],
//         "script-src": [
//           "'self'",
//           "'unsafe-inline'",
//           "https://checkout.razorpay.com",
//         ],
//         "script-src-elem": [
//           "'self'",
//           "'unsafe-inline'",
//           "https://checkout.razorpay.com",
//         ],
//         "frame-src": [
//           "'self'",
//           "https://api.razorpay.com",
//           "https://checkout.razorpay.com",
//         ],
//         "connect-src": [
//           "'self'",
//           "https://api.razorpay.com",
//           "https://checkout.razorpay.com",
//         ],
//       },
//     },
//   }),
// );

// app.use(helmet({
//   contentSecurityPolicy: false,
//   crossOriginEmbedderPolicy: false,
// }));

app.use((req, res, next) => {
  Object.defineProperty(req, "query", {
    value: { ...req.query },
    writable: true,
    configurable: true,
    enumerable: true,
  });
  next();
});
app.use(mongoSanitize());

app.use(hpp());

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? false
        : ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  }),
);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 100 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP. Please try again later.",
  },
});

app.use("/api", limiter);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(compression());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "BhojanQR API is healthy and running!",
  });
});

app.use("/api/admin", adminRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/config", configRoutes);
app.use(express.static(path.join(rootDir, "client/dist")));

app.get("/{*splat}", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../client/dist/index.html"));
});

app.use(notFound);
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(
    `${colors.bold}${colors.cyan} Server running in ${
      process.env.NODE_ENV || "development"
    } mode on ${colors.green}http://localhost:${PORT}${colors.reset}`,
  );
});

process.on("unhandledRejection", (err) => {
  console.log(
    `${colors.bold}${colors.red} Unhandled Rejection: ${err.message}${colors.reset}`,
  );

  server.close(() => process.exit(1));
});
