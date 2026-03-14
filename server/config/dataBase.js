const mongoose = require("mongoose");

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  red: "\x1b[31m",
  bold: "\x1b[1m",
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    // console.log(
    //   `${colors.cyan}Database: MongoDB Connected to ${colors.green}${conn.connection.host}${colors.reset}`,
    // );
    console.log(
      `${colors.green}Database: MongoDB Connected Successfully${colors.reset}`,
    );
  } catch (error) {
    console.error(
      `${colors.bold}${colors.red}Database Connection Error: ${error.message}${colors.reset}`,
    );
    process.exit(1);
  }
};

module.exports = connectDB;
