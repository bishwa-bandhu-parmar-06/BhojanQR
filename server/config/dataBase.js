const mongoose = require("mongoose");
const MONGO_URL = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/BhojanQR"; // Default local DB

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URL, {
      socketTimeoutMS: 1000, // Optional: Adjust timeout as needed
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
