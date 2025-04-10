const dotenv = require("dotenv");
dotenv.config();
const Contact = require("../models/contactModel");
const transporter = require("../config/nodemailer");

const submitContactForm = async (req, res) => {
  try {
    const { name, email, mobile, message } = req.body;

    // Create new contact message
    const contactMessage = await Contact.create({
      name,
      email,
      mobile,
      message,
    });

    // Send confirmation email to the user
    await transporter.sendMail({
      from: `"BhojanQR Support" <${process.env.SENDER_EMAIL}>`,
      to: email,
      subject: "Thank you for contacting BhojanQR",
      html: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>BhojanQR - Contact Form Submission</title>
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
        .message {
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
            text-align: left;
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
            <h2>Dear ${name},</h2>
            <p>Thank you for reaching out to us. We have received your message and will get back to you soon.</p>
            <div class="message">
                <p><strong>Your Message:</strong></p>
                <p>${message}</p>
            </div>
            <p>Best regards,<br>BhojanQR Team</p>
        </div>
        <div class="footer">
            <p>&copy; 2025 BhojanQR. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`,
      attachments: [
        {
          filename: "BhojanQR.png",
          path: "./uploads/BhojanQR.png",
          cid: "logo",
        },
      ],
    });

    // Send notification email to admin
    await transporter.sendMail({
      from: `"BhojanQR Support" <${process.env.SENDER_EMAIL}>`,
      to: process.env.SENDER_EMAIL,
      subject: "New Contact Form Submission",
      html: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>BhojanQR - New Contact Form Submission</title>
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
            text-align: left;
            font-size: 16px;
            color: #333;
        }
        .details {
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
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
            <h2>New Contact Form Submission</h2>
            <div class="details">
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Mobile:</strong> ${mobile}</p>
                <p><strong>Message:</strong></p>
                <p>${message}</p>
            </div>
        </div>
        <div class="footer">
            <p>&copy; 2025 BhojanQR. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`,
      attachments: [
        {
          filename: "BhojanQR.png",
          path: "./uploads/BhojanQR.png",
          cid: "logo",
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: contactMessage,
    });
  } catch (error) {
    console.error("Contact form submission error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error.message,
    });
  }
};

module.exports = { submitContactForm };
