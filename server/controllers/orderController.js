const Order = require("../models/Order");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/ErrorResponse");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

// ==========================================
// PUBLIC ROUTES (Customers placing orders)
// ==========================================

// @desc      Create Order
exports.createOrder = asyncHandler(async (req, res, next) => {
  const { restaurantId, customerName, tableNumber, items, totalPrice } =
    req.body;

  if (!restaurantId)
    return next(new ErrorResponse("Restaurant ID is required", 400));

  const newOrder = await Order.create({
    restaurant: restaurantId, // Tie order to the hotel
    customerName,
    tableNumber,
    items,
    totalPrice,
    paymentStatus: "pending",
  });

  const razorpayOrder = await razorpay.orders.create({
    amount: totalPrice * 100,
    currency: "INR",
    receipt: newOrder._id.toString(),
  });

  newOrder.razorpayOrderId = razorpayOrder.id;
  await newOrder.save();

  res.status(200).json({
    success: true,
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    orderDBId: newOrder._id,
  });
});

// @desc      Verify Payment
exports.verifyPayment = asyncHandler(async (req, res, next) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderDBId,
  } = req.body;

  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (generatedSignature !== razorpay_signature) {
    return next(new ErrorResponse("Invalid payment signature", 400));
  }

  const order = await Order.findByIdAndUpdate(
    orderDBId,
    {
      paymentStatus: "Paid",
      razorpayPaymentId: razorpay_payment_id,
    },
    { new: true },
  );

  res.status(200).json({ success: true, message: "Payment verified", order });
});

// @desc      Get Order Status by Token (Public for customer)
exports.getOrderByToken = asyncHandler(async (req, res, next) => {
  const order = await Order.findOne({ razorpayPaymentId: req.params.token });
  if (!order) return next(new ErrorResponse("Order not found", 404));
  res.status(200).json({ success: true, data: order });
});

// ==========================================
// RESTAURANT ROUTES (Hotel managing orders)
// ==========================================

// @desc      Get All Orders for Logged-in Hotel
exports.getRestaurantOrders = asyncHandler(async (req, res, next) => {
  // Only fetch orders that belong to this specific hotel
  const orders = await Order.find({ restaurant: req.user.id }).sort({
    createdAt: -1,
  });
  res.status(200).json({ success: true, data: orders });
});

// @desc      Update Order Status (Hotel Only)
exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  // Ensure the order belongs to this hotel before updating
  const order = await Order.findOneAndUpdate(
    { _id: req.params.id, restaurant: req.user.id },
    { status: req.body.status },
    { new: true },
  );

  if (!order)
    return next(new ErrorResponse("Order not found or unauthorized", 404));
  res
    .status(200)
    .json({ success: true, message: "Status updated", data: order });
});
