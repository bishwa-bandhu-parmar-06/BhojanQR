const admin = require("firebase-admin");

const sendPushNotification = async (tokens, title, body, data = {}) => {
  try {
    const targetTokens = Array.isArray(tokens) ? tokens : [tokens];

    if (!targetTokens || targetTokens.length === 0 || !targetTokens[0]) {
      console.log("No FCM token provided, skipping notification.");
      return false;
    }

    const stringifiedData = {};
    for (const key in data) {
      if (data[key] !== undefined && data[key] !== null) {
        stringifiedData[key] = String(data[key]);
      }
    }

    const message = {
      notification: {
        title: title,
        body: body,
      },
      data: stringifiedData,
      tokens: targetTokens,
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    console.log(
      `Notification sent! Success: ${response.successCount}, Failed: ${response.failureCount}`,
    );

    if (response.failureCount > 0) {
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          console.error(`Token Failed [${idx}]:`, resp.error.message);
        }
      });
    }

    return true;
  } catch (error) {
    console.error("Critical Error sending push notification:", error);
    return false;
  }
};

module.exports = sendPushNotification;
