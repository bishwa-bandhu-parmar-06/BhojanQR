const Order = require("../models/Order");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/ErrorResponse");
const Restaurant = require("../models/Restaurant");
const Notification = require("../models/NotificationModel");
const sendPushNotification = require("../utils/fcmHelper");
const redisClient = require("../config/redis");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

// Helper function to handle multiple cache invalidation steps for restaurant orders data
const clearRestaurantOrderCache = async (restaurantId) => {
  try {
    const analyticsKey = `dashboard_analytics:${restaurantId}`;
    const ordersListKey = `orders:list:${restaurantId}`;
    const notificationsKey = `notifications:user:${restaurantId}`;

    await Promise.all([
      redisClient.del(analyticsKey),
      redisClient.del(ordersListKey),
      redisClient.del(notificationsKey),
    ]);
  } catch (err) {
    console.error("Redis Order Invalidation Error:", err.message);
  }
};

// Create a draft transaction record and initiate a structural payment token with Razorpay gateway
exports.createOrder = asyncHandler(async (req, res, next) => {
  const {
    restaurantId,
    customerName,
    tableNumber,
    items,
    totalPrice,
    customerFcmToken,
  } = req.body;

  if (!restaurantId) {
    return next(new ErrorResponse("Restaurant ID is required", 400));
  }

  const newOrder = await Order.create({
    restaurant: restaurantId,
    customerName,
    tableNumber,
    items,
    totalPrice,
    paymentStatus: "pending",
    customerFcmToken: customerFcmToken || null,
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

// Verify cryptographic webhook signature and permanently confirm successful payment logs
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
    { paymentStatus: "Paid", razorpayPaymentId: razorpay_payment_id },
    { new: true },
  );

  if (order) {
    const restaurantIdStr = order.restaurant.toString();

    // Invalidation Lock: Reset operational caching parameters to synchronize updates instantly
    await clearRestaurantOrderCache(restaurantIdStr);

    // Invalidate specific token tracking lookup to reflect payment verification immediately
    await redisClient.del(`order:token:${razorpay_payment_id}`);
  }

  res.status(200).json({ success: true, message: "Payment verified", order });

  try {
    const restaurant = await Restaurant.findById(order.restaurant);
    if (restaurant) {
      const title = "New Order Received!";
      const message = `Table ${order.tableNumber} just placed an order for ${order.totalPrice}.`;
      const type = "NEW_ORDER";

      await Notification.create({
        recipientModel: "Restaurant",
        recipientId: restaurant._id,
        title,
        message,
        type,
        relatedId: order._id,
      });
    }
  } catch (error) {
    console.error("New Order Notification Error:", error);
  }
});

// Retrieve localized transaction details using verification key for user tracking screens
exports.getOrderByToken = asyncHandler(async (req, res, next) => {
  const token = req.params.token;
  const cacheKey = `order:token:${token}`;

  try {
    const cachedOrder = await redisClient.get(cacheKey);
    if (cachedOrder) {
      return res.status(200).json({
        success: true,
        source: "redis",
        data: JSON.parse(cachedOrder),
      });
    }
  } catch (cacheErr) {
    console.error("Redis Cache Read Error:", cacheErr.message);
  }

  const order = await Order.findOne({ razorpayPaymentId: token });
  if (!order) {
    return next(new ErrorResponse("Order not found", 404));
  }

  try {
    // Cache tracking record for five minutes to lower overhead from active customer updates
    await redisClient.setEx(cacheKey, 300, JSON.stringify(order));
  } catch (cacheSetErr) {
    console.error("Redis Cache Write Error:", cacheSetErr.message);
  }

  res.status(200).json({ success: true, source: "database", data: order });
});

// Fetch historical and current transaction logs belonging to properties manager dashboard
exports.getRestaurantOrders = asyncHandler(async (req, res, next) => {
  const restaurantId = req.user.id;
  const cacheKey = `orders:list:${restaurantId}`;

  try {
    const cachedOrders = await redisClient.get(cacheKey);
    if (cachedOrders) {
      return res.status(200).json({
        success: true,
        source: "redis",
        data: JSON.parse(cachedOrders),
      });
    }
  } catch (cacheErr) {
    console.error("Redis Cache Read Error:", cacheErr.message);
  }

  const orders = await Order.find({
    restaurant: restaurantId,
    paymentStatus: "Paid",
  }).sort({
    createdAt: -1,
  });

  try {
    // Cache order list parameters for thirty minutes
    await redisClient.setEx(cacheKey, 1800, JSON.stringify(orders));
  } catch (cacheSetErr) {
    console.error("Redis Cache Write Error:", cacheSetErr.message);
  }

  res.status(200).json({ success: true, source: "database", data: orders });
});

// Modify internal state parameters and initiate client alert mechanisms across devices
exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status, eta, cancellationReason } = req.body;
  const restaurantIdStr = req.user.id;

  let order = await Order.findOne({
    _id: req.params.id,
    restaurant: restaurantIdStr,
  });

  if (!order) {
    return next(new ErrorResponse("Order not found or unauthorized", 404));
  }

  if (status === "Cancelled" && order.paymentStatus === "Paid") {
    try {
      await razorpay.payments.refund(order.razorpayPaymentId, {
        notes: {
          reason: cancellationReason || "Order cancelled by restaurant",
          orderId: order._id.toString(),
        },
      });

      order.paymentStatus = "Refunded";
      console.log(`Refund initiated for order ${order._id}`);
    } catch (refundError) {
      console.error("Razorpay Refund Error:", refundError);
      return next(new ErrorResponse("Failed to initiate refund", 500));
    }
  }

  order.status = status;
  if (eta) order.eta = eta;
  if (cancellationReason) order.cancellationReason = cancellationReason;
  await order.save();

  // Invalidation Lock: Force clear cache configurations to allow instant client screen refresh
  await clearRestaurantOrderCache(restaurantIdStr);
  if (order.razorpayPaymentId) {
    await redisClient.del(`order:token:${order.razorpayPaymentId}`);
  }

  if (order.customerFcmToken && status !== "Pending") {
    let title = "";
    let body = "";

    if (status === "Preparing") {
      title = "Chef is on it!";
      body = `Hi ${order.customerName}, your food is now being prepared.`;
    } else if (status === "Completed") {
      title = "Order Ready!";
      body = `Hi ${order.customerName}, your order for Table ${order.tableNumber} is ready to be served!`;
    } else if (status === "Cancelled") {
      title = "Order Cancelled";
      body = `Your order was cancelled. ${cancellationReason ? `Reason: ${cancellationReason}` : ""}`;
    }

    if (title && body) {
      try {
        await sendPushNotification([order.customerFcmToken], title, body, {
          type: "ORDER_TRACKING",
          orderId: order._id.toString(),
        });
      } catch (fcmError) {
        console.error(
          "Customer Notification Failed, but order updated:",
          fcmError,
        );
      }
    }
  }

  res.status(200).json({
    success: true,
    message: `Order status updated to ${status}`,
    data: order,
  });
});
