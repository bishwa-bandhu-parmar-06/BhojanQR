const order = require("../models/Order");

exports.getAllOrders = async (req, res) => {
  try {
    const allOrders = await order.find().sort({ createdAt: -1 }); // ✅ latest order first;

    res.status(201).json({
      success: true,
      response: allOrders,
    });
  } catch (error) {
    console.log("error occurs while get all orders : ", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      response: error,
    });
  }
};

exports.getOrderByToken = async (req, res) => {
  try {
    const { token } = req.params;
    // console.log("Checking Token : ",token);
    const orderData = await order.findOne({ razorpayPaymentId: token }); // Adjust field if different

    if (!orderData) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res.status(200).json(orderData); // Send just the order
  } catch (error) {
    console.error("Error fetching order by token:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
