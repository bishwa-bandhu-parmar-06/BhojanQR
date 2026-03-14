const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  bold: "\x1b[1m",
};

// Create transporter with Brevo SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify SMTP Connection
transporter.verify((error, success) => {
  if (error) {
    console.error(
      `${colors.bold}${colors.red}SMTP Connection Failed: ${error.message}${colors.reset}`,
    );
  } else {
    console.log(
      `${colors.green}SMTP: Brevo connected successfully${colors.reset}`,
    );
  }
});

module.exports = transporter;
