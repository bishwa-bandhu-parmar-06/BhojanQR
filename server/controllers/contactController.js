const Contact = require("../models/contactModel");
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/ErrorResponse");


exports.submitContactForm = asyncHandler(async (req, res, next) => {
  const { name, email, mobile, message } = req.body;

  const contactMessage = await Contact.create({
    name,
    email,
    mobile,
    message,
  });


  res.status(201).json({
    success: true,
    message: "Message sent successfully",
    data: contactMessage,
  });
});
