
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/Order");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

// ✅ Create Order (without notification)
exports.createOrder = async (req, res) => {
  try {
    const { customerName, tableNumber, items, totalPrice } = req.body;

    const newOrder = new Order({
      customerName,
      tableNumber,
      items,
      totalPrice,
      paymentStatus: "pending",
    });

    const savedOrder = await newOrder.save();

    const razorpayOrder = await razorpay.orders.create({
      amount: totalPrice * 100,
      currency: "INR",
      receipt: savedOrder._id.toString(),
    });

    savedOrder.razorpayOrderId = razorpayOrder.id;
    await savedOrder.save();

    res.status(200).json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      orderDBId: savedOrder._id,
    });
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ success: false, message: "Order creation failed" });
  }
};

// ✅ Verify Payment (no change here)
exports.verifyPayment = async (req, res) => {
  try {
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
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    const order = await Order.findById(orderDBId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    order.paymentStatus = "Paid";
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    res.status(200).json({ success: true, message: "Payment verified" });
  } catch (err) {
    console.error("Error verifying payment:", err);
    res.status(500).json({ success: false, message: "Verification failed" });
  }
};

// ✅ Update Order Status (without notification)
exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    res.json({ 
      success: true,
      order,
      message: 'Order status updated successfully'
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating order status',
      error: error.message
    });
  }
};

// ✅ Get Order by ID (no change here)
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order', error: error.message });
  }
};
