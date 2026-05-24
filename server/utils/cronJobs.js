const cron = require("node-cron");
const Razorpay = require("razorpay");
const Order = require("../models/Order");
const Notification = require("../models/NotificationModel"); // Apne naye model ka naam use kiya hai
const sendPushNotification = require("./fcmHelper");

const colors = {
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  reset: "\x1b[0m",
};

// Initialize Razorpay for Auto-Refunds
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

cron.schedule("0 0 * * *", async () => {
  try {
    console.log(
      `${colors.yellow}🧹 Running Cron Job: Cleaning up old pending orders...${colors.reset}`,
    );

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const result = await Order.deleteMany({
      paymentStatus: "pending",
      createdAt: { $lt: twentyFourHoursAgo },
    });

    if (result.deletedCount > 0) {
      console.log(
        `${colors.green}✅ Successfully deleted ${result.deletedCount} unpaid/abandoned orders.${colors.reset}`,
      );
    } else {
      console.log(
        `${colors.green}👍 Database is clean. No old pending orders found.${colors.reset}`,
      );
    }
  } catch (error) {
    console.error(
      `${colors.red}❌ Error in cleanup cron job: ${error.message}${colors.reset}`,
    );
  }
});
console.log(
  `${colors.cyan}⏰ Cron Job Activated: Database cleaner scheduled for midnight.${colors.reset}`,
);

// ==========================================
// 2. SLA AUTO-REJECT: Refund paid orders unaccepted for 15 mins
// ==========================================
// Ye job har 1 minute me chalegi
cron.schedule("* * * * *", async () => {
  try {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    // Dhoondo wo orders jo 'Paid' hain, par 15 minute se 'Pending' state me atke hain
    const expiredOrders = await Order.find({
      status: "Pending",
      paymentStatus: "Paid",
      createdAt: { $lt: fifteenMinutesAgo },
    });

    if (expiredOrders.length > 0) {
      console.log(
        `${colors.yellow}⏳ Found ${expiredOrders.length} expired orders. Initiating Auto-Refunds...${colors.reset}`,
      );

      for (let order of expiredOrders) {
        try {
          // 1. SMART BYPASS: Check if in production or development
          if (process.env.NODE_ENV === "production") {
            // ASLI RAZORPAY (Sirf live server par chalega)
            if (order.razorpayPaymentId) {
              await razorpay.payments.refund(order.razorpayPaymentId, {
                notes: {
                  reason: "Auto-rejected: SLA breach (15 mins exceeded)",
                  orderId: order._id.toString(),
                },
              });
            }
          } else {
            // TEST MODE MOCK (Localhost par sirf DB update hoga)
            console.log(
              `${colors.cyan}🔧 Test Mode: Bypassing actual Razorpay refund for order ${order._id}${colors.reset}`,
            );
          }

          // 2. Update Database Order Status
          order.status = "Cancelled";
          order.paymentStatus = "Refunded";
          order.cancellationReason =
            "Restaurant was too busy to accept your order in time.";
          await order.save();

          // 3. Notify Customer
          if (order.customerFcmToken) {
            const custMsg =
              "Apologies! The restaurant is currently too busy to accept your order. A full refund has been initiated automatically.";
            await sendPushNotification(
              [order.customerFcmToken],
              "Order Auto-Cancelled ⚠️",
              custMsg,
              { type: "ORDER_CANCELLED", orderId: order._id.toString() },
            );
          }

          // 4. Notify Restaurant via Database (Bell Icon)
          const restMsg = `Table ${order.tableNumber}'s order was auto-cancelled because it wasn't accepted within 15 minutes. Refund initiated.`;
          await Notification.create({
            recipientModel: "Restaurant",
            recipientId: order.restaurant,
            title: "SLA Breach - Order Auto-Cancelled ❌",
            message: restMsg,
            type: "ORDER_UPDATE",
            relatedId: order._id,
          });

          console.log(
            `${colors.green}✅ Auto-refund processed for order ${order._id}${colors.reset}`,
          );
        } catch (err) {
          // Error logging theek kar diya, ab undefined nahi aayega
          const errorMessage =
            err.error?.description || err.message || "Unknown error";
          console.error(
            `${colors.red}❌ Failed to process auto-refund for order ${order._id}: ${errorMessage}${colors.reset}`,
          );
        }
      }
    }
  } catch (error) {
    console.error(
      `${colors.red}❌ Error in SLA cron job: ${error.message}${colors.reset}`,
    );
  }
});
console.log(
  `${colors.cyan}⏰ SLA Cron Job Activated: Checking for 15-min expired orders every minute.${colors.reset}`,
);

module.exports = cron;
