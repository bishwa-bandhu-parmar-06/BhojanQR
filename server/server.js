const dotenv = require("dotenv");
dotenv.config(); // Moved up, only needs to be called once

const express = require("express");
const path = require("path");
const cors = require("cors");
const connectDb = require("./config/dataBase");
const cookieParser = require("cookie-parser");

// get all orders
// const {getAllOrders} = require("./controllers/orderReceived");

// console.log("all orders: ", getAllOrders());


const adminRoutes = require("./routes/adminRoutes");
const menuRoutes = require('./routes/menuRoutes');
const contactRoutes = require('./routes/contactRoutes');
const orderRoutes = require("./routes/orderRoutes");
const orderReceivedRoutes = require("./routes/orderReceiveRoutes");
const app = express();

// Middleware
// Enhanced CORS configuration
const corsOptions = {
  origin: [
    // 'https://bhojan-qr.vercel.app',
    'http://localhost:5173'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200 // For legacy browser support
};

app.use(cors(corsOptions));

// Handle pre-flight requests
// app.options('*', cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Default Route
app.get("/", (req, res) => {
  res.send("BhojanQR API is Running...");
});

// Routes
app.use("/api/admin", adminRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/contact', contactRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/orderreceived", orderReceivedRoutes);


// Connect to DB
connectDb();

// Server Listening
const PORT = process.env.PORT || 3000;



const server = app.listen(PORT, () => {
  console.log(`Server is running on Port ${PORT}`);
});
