const cron = require("node-cron");
const Razorpay = require("razorpay");
const Order = require("../models/Order");
const Notification = require("../models/NotificationModel");
const sendPushNotification = require("./fcmHelper");

// Terminal color codes for better debugging logs
const colors = {
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  reset: "\x1b[0m",
};

// Initialize Razorpay instance for automated refunds
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

/**
 * ============================================================================
 * CRON JOB 1: DATABASE CLEANUP (Runs daily at Midnight IST)
 * Purpose: Deletes unpaid/abandoned orders older than 24 hours to save DB space.
 * ============================================================================
 */
cron.schedule(
  "0 0 * * *",
  async () => {
    try {
      console.log(
        `${colors.yellow}Running Database Cleanup: Scanning for old pending orders...${colors.reset}`,
      );

      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      // Only delete orders where payment was never completed
      const result = await Order.deleteMany({
        paymentStatus: "pending",
        createdAt: { $lt: twentyFourHoursAgo },
      });

      if (result.deletedCount > 0) {
        console.log(
          `${colors.green}Successfully deleted ${result.deletedCount} unpaid/abandoned orders.${colors.reset}`,
        );
      } else {
        console.log(
          `${colors.green}Database is clean. No abandoned orders found.${colors.reset}`,
        );
      }
    } catch (error) {
      console.error(
        `${colors.red}Cleanup job failed: ${error.message}${colors.reset}`,
      );
    }
  },
  {
    scheduled: true,
    timezone: "Asia/Kolkata",
  },
);

console.log(
  `${colors.cyan}Cron Job Activated: Database cleaner scheduled for Midnight (IST).${colors.reset}`,
);

/**
 * ============================================================================
 * CRON JOB 2: SLA BREACH & AUTO-REFUND (Runs every 1 minute)
 * Purpose: Finds PAID orders not accepted within 15 mins. Cancels them and
 * triggers an automated Razorpay refund. Does NOT delete the order.
 * ============================================================================
 */
cron.schedule(
  "* * * * *",
  async () => {
    try {
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

      // Find orders that are PAID but still PENDING (not accepted by restaurant)
      const expiredOrders = await Order.find({
        status: "Pending",
        paymentStatus: "Paid",
        createdAt: { $lt: fifteenMinutesAgo },
      });

      if (expiredOrders.length > 0) {
        console.log(
          `${colors.yellow}Found ${expiredOrders.length} expired order(s). Initiating Auto-Refunds...${colors.reset}`,
        );

        for (let order of expiredOrders) {
          try {
            // 1. Process Razorpay Refund
            // Note: If you want refunds to trigger even in local testing, remove the NODE_ENV check.
            if (
              process.env.NODE_ENV === "production" ||
              process.env.NODE_ENV === "development"
            ) {
              if (order.razorpayPaymentId) {
                await razorpay.payments.refund(order.razorpayPaymentId, {
                  notes: {
                    reason:
                      "Auto-rejected: SLA breach (15 mins exceeded without acceptance)",
                    orderId: order._id.toString(),
                  },
                });
              }
            }

            // 2. Update Database Order Status (Do not delete, just mark as Cancelled/Refunded)
            order.status = "Cancelled";
            order.paymentStatus = "Refunded";
            order.cancellationReason =
              "Restaurant was too busy to accept your order in time.";
            await order.save();

            // 3. Notify Customer via Push Notification
            if (order.customerFcmToken) {
              const custMsg =
                "Apologies! The restaurant is currently too busy to accept your order. A full refund has been initiated automatically.";
              await sendPushNotification(
                [order.customerFcmToken],
                "Order Auto-Cancelled",
                custMsg,
                { type: "ORDER_CANCELLED", orderId: order._id.toString() },
              );
            }

            // 4. Notify Restaurant via Database Notification
            const restMsg = `Table ${order.tableNumber}'s order was auto-cancelled because it wasn't accepted within 15 minutes. Customer has been refunded.`;
            await Notification.create({
              recipientModel: "Restaurant",
              recipientId: order.restaurant,
              title: "SLA Breach - Order Auto-Cancelled",
              message: restMsg,
              type: "ORDER_UPDATE",
              relatedId: order._id,
            });

            console.log(
              `${colors.green}Auto-refund processed & notifications sent for order: ${order._id}${colors.reset}`,
            );
          } catch (err) {
            const errorMessage =
              err.error?.description || err.message || "Unknown error";
            console.error(
              `${colors.red}Failed to process auto-refund for order ${order._id}: ${errorMessage}${colors.reset}`,
            );
          }
        }
      }
    } catch (error) {
      console.error(
        `${colors.red}SLA job failed: ${error.message}${colors.reset}`,
      );
    }
  },
  {
    scheduled: true,
    timezone: "Asia/Kolkata", 
  },
);

console.log(
  `${colors.cyan}SLA Cron Job Activated: Monitoring for 15-min expired orders every minute.${colors.reset}`,
);

module.exports = cron;
