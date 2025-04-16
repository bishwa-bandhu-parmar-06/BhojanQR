const Admin = require("../models/Admin");
const jwt = require("jsonwebtoken");
const transporter = require("../config/nodemailer");
// const nodemailer = require("nodemailer"); // ✅ Import nodemailer
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Set up storage for profile pictures
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

// Function to send OTP via email
const sendOTPEmail = async (email, otp) => {
  try {
    // console.log(`🚀 Sending OTP to: ${email} | OTP: ${otp}`);

    let info = await transporter.sendMail({
      from: `"Admin Support" <${process.env.SENDER_EMAIL}>`, // Brevo sender
      to: email,
      subject: "Your OTP for Verification",
      text: `Your OTP is: ${otp}. It is valid for 10 minutes.`,
      html: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>BhojanQR - OTP Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background-color: #ff6600;
            color: white;
            text-align: center;
            padding: 15px;
        }
        .logo {
            max-width: 150px;
        }
        .content {
            padding: 20px;
            text-align: center;
            font-size: 16px;
            color: #333;
        }
        .otp {
            font-size: 22px;
            font-weight: bold;
            color: #008000;
        }
        .footer {
            background-color: #f4f4f4;
            padding: 15px;
            text-align: center;
            font-size: 12px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="cid:logo" alt="BhojanQR Logo" class="logo">
        </div>
        <div class="content">
            <p>Hello,</p>
            <p>Your OTP for verification is:</p>
            <p class="otp">${otp}</p>
            <p>This OTP is valid for 10 minutes. Please do not share it with anyone.</p>
        </div>
        <div class="footer">
            <p>&copy; 2025 BhojanQR. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`,
      attachments: [
        {
          filename: "BhojanQR.png",
          path: "./uploads/BhojanQR.png", // Ensure the path is correct
          cid: "logo", // Use this CID to reference the image in HTML
        },
      ],
    });
  } catch (error) {
    console.error("❌ Error Sending OTP Email:", error);
  }
};

// ✅ Register Admin (Send OTP)
exports.registerAdmin = async (req, res) => {
  try {
    const { name, email, mobile } = req.body;
    let admin = await Admin.findOne({ email });

    if (!admin) {
      admin = new Admin({ name, email, mobile, isVerified: false });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    admin.otp = otp;
    await admin.save();

    await sendOTPEmail(email, otp);

    res.status(200).json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    console.error("Error in registerAdmin:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Verify OTP & Complete Registration
exports.verifyOTPAndRegister = async (req, res) => {
  try {
    const { email, enteredOTP } = req.body;
    const admin = await Admin.findOne({ email });

    // console.log("Entered OTP:", enteredOTP);
    // console.log("Stored OTP:", admin?.otp);

    // Ensure both OTPs are strings before comparing
    if (!admin || admin.otp?.toString() !== enteredOTP.toString()) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    admin.isVerified = true;
    admin.otp = null;
    await admin.save();

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });

    res
      .status(201)
      .json({ success: true, message: "Registration successful", token });
  } catch (error) {
    console.error("Error in verifyOTPAndRegister:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Login Admin (Send OTP)
exports.loginAdmin = async (req, res) => {
  try {
    const { email } = req.body;
    let admin = await Admin.findOne({ email });

    if (!admin)
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });

    const otp = Math.floor(100000 + Math.random() * 900000);
    admin.otp = otp;
    await admin.save();

    await sendOTPEmail(email, otp);

    res.json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Verify OTP & Login
exports.verifyOTPAndLogin = async (req, res) => {
  try {
    const { email, enteredOTP } = req.body;
    const admin = await Admin.findOne({ email });

    if (!admin || admin.otp?.toString() !== enteredOTP.toString()) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    admin.otp = null;
    await admin.save();

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });

    res.json({ success: true, message: "Login successful", token });
  } catch (error) {
    console.error("Error in verifyOTPAndLogin:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Get Admin Profile
exports.getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).select("-otp");
    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }
    res.status(200).json({ success: true, admin });
  } catch (error) {
    console.error("Error in getAdminProfile:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Update Admin Profile
exports.updateAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);

    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }

    // Update fields if they exist in the request
    if (req.body.name) admin.name = req.body.name;
    if (req.body.mobile) admin.mobile = req.body.mobile;

    // Handle profile photo if uploaded
    if (req.file) {
      try {
        // Delete old profile photo if exists
        if (admin.profilePhoto) {
          const oldPhotoPath = path.join(
            __dirname,
            "..",
            "uploads",
            path.basename(admin.profilePhoto)
          );
          if (fs.existsSync(oldPhotoPath)) {
            fs.unlinkSync(oldPhotoPath);
          }
        }
        // Save new profile photo path
        admin.profilePhoto = `/uploads/${req.file.filename}`;
      } catch (fileError) {
        console.error("Error handling profile photo:", fileError);
        // Continue with the update even if photo handling fails
      }
    }

    await admin.save();

    // Return updated admin data without sensitive fields
    const updatedAdmin = await Admin.findById(admin._id)
      .select("-password -otp -__v")
      .lean();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      admin: updatedAdmin,
    });
  } catch (error) {
    console.error("Error in updateAdminProfile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

exports.requestEmailChange = async (req, res) => {
  try {
    const { newEmail } = req.body;
    const admin = await Admin.findById(req.admin._id);

    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }

    if (!newEmail) {
      return res
        .status(400)
        .json({ success: false, message: "New email is required" });
    }

    // Check if new email is already in use
    const existingAdmin = await Admin.findOne({ email: newEmail });
    if (existingAdmin) {
      return res
        .status(400)
        .json({ success: false, message: "Email already in use" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    admin.emailChangeOTP = otp;
    admin.newEmail = newEmail;
    await admin.save();

    // Send OTP to new email
    await sendOTPEmail(newEmail, otp);

    res.json({ success: true, message: "OTP sent to new email" });
  } catch (error) {
    console.error("Error in requestEmailChange:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process email change request",
    });
  }
};

exports.verifyEmailChange = async (req, res) => {
  try {
    const { otp } = req.body;
    const admin = await Admin.findById(req.admin._id);

    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }

    if (!otp || !admin.emailChangeOTP || otp !== admin.emailChangeOTP) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // Update email
    admin.email = admin.newEmail;
    admin.newEmail = null;
    admin.emailChangeOTP = null;
    await admin.save();

    res.json({ success: true, message: "Email updated successfully" });
  } catch (error) {
    console.error("Error in verifyEmailChange:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to verify email change" });
  }
};

// ✅ Logout Admin
exports.logoutAdmin = async (req, res) => {
  try {
    res.cookie("token", "", {
      expires: new Date(0),
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });
    res.json({ success: true, message: "Logout successful" });
  } catch (error) {
    console.error("Error in logoutAdmin:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Verify JWT Token
exports.verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ valid: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return res.status(401).json({ valid: false, message: "Invalid token" });
    }

    res.json({ valid: true });
  } catch (error) {
    res.status(401).json({ valid: false, message: "Invalid token" });
  }
};

// Export the upload middleware
exports.upload = upload;
