const admin = require("firebase-admin");

// Universal function to send push notifications
const sendPushNotification = async (tokens, title, body, data = {}) => {
  try {
    // Agar array nahi hai (sirf ek token hai customer jaisa), toh usko array bana do
    const targetTokens = Array.isArray(tokens) ? tokens : [tokens];

    // Agar token empty hai, toh aage mat badho
    if (!targetTokens || targetTokens.length === 0 || !targetTokens[0]) {
      console.log("⚠️ No FCM token provided, skipping notification.");
      return false;
    }

    // FIREBASE RULE: Data object ke andar har value strictly STRING honi chahiye!
    // Isliye hum yahan loop lagakar har cheez ko securely string bana rahe hain.
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
      data: stringifiedData, // Safe stringified data
      tokens: targetTokens, // Array of tokens
    };

    // Firebase v12+ require 'sendEachForMulticast' instead of 'sendMulticast'
    const response = await admin.messaging().sendEachForMulticast(message);

    console.log(
      `✅ Notification sent! Success: ${response.successCount}, Failed: ${response.failureCount}`,
    );

    // Agar koi token fail hua hai, toh uski exact wajah console me dikhao
    if (response.failureCount > 0) {
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          console.error(`❌ Token Failed [${idx}]:`, resp.error.message);
        }
      });
    }

    return true;
  } catch (error) {
    console.error("❌ Critical Error sending push notification:", error);
    return false;
  }
};

module.exports = sendPushNotification;
