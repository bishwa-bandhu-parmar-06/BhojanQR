// const { GoogleGenerativeAI } = require("@google/generative-ai");
// const Restaurant = require("../models/Restaurant");
// const Menu = require("../models/Menu");
// const Order = require("../models/Order");

// // Initialize Gemini SDK
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// exports.handleCustomerChat = async (req, res) => {
//   try {
//     const { restaurantId, userMessage } = req.body;

//     const restaurant = await Restaurant.findById(restaurantId);
//     const menuItems = await Menu.find({ restaurant: restaurantId });

//     const menuData = menuItems
//       .map(
//         (item) =>
//           `${item.name} - ₹${item.price} (${item.category}): ${item.description}`,
//       )
//       .join("\n");

//     let orderContext = "";

//     const orderIdMatch = userMessage.match(/pay_[a-zA-Z0-9]+/i);

//     if (orderIdMatch) {
//       const tokenNo = orderIdMatch[0];

//       const order = await Order.findOne({
//         restaurant: restaurantId,
//         razorpayPaymentId: tokenNo,
//       }).populate("items.menuItem");

//       if (order) {
//         orderContext = `
//         IMPORTANT LIVE DATA: The customer is asking about their order.
//         Here are the exact details for Payment ID: ${tokenNo}:
//         - Customer Name: ${order.customerName}
//         - Status: ${order.status}
//         - Total Price: ₹${order.totalPrice}
//         - Payment Status: ${order.paymentStatus}
//         - Cancellation Reason: ${order.cancellationReason ? order.cancellationReason : "Not specified"}

//         INSTRUCTION FOR YOU:
//         If the status is "Cancelled", you MUST address the customer by their Name. Inform them politely about the cancellation, mention the specific Cancellation Reason, and assure them about their Payment Status (e.g., Refunded).
//         Make it sound empathetic, like: "I'm so sorry to inform you, [Name]..."`;
//       } else {
//         orderContext = `
//         IMPORTANT LIVE DATA: The customer mentioned Payment ID ${tokenNo}, but no such active order was found in the system right now. Politely ask them to verify their ID.`;
//       }
//     }

//     const systemPrompt = `You are a highly advanced AI Virtual Waiter for ${restaurant.restaurantName}.
//     Here is the exact menu available right now:
//     ${menuData}

//     ${orderContext}

//     CRITICAL INSTRUCTION: You MUST ALWAYS reply in strict JSON format. Never output plain text outside the JSON.

//     If the customer is just chatting, return:
//     {
//       "type": "CHAT",
//       "replyMessage": "Your conversational reply here",
//       "actions": []
//     }

//     If the customer wants to ADD an item to order/cart, return:
//     {
//       "type": "ADD_ORDER",
//       "replyMessage": "Polite confirmation message for adding",
//       "actions": [
//         { "menuItemId": "The exact ObjectId from the menu list", "name": "Item Name", "quantity": 1, "price": 150 }
//       ]
//     }

//     If the customer wants to REMOVE or DELETE an item completely, return:
//     {
//       "type": "REMOVE_ITEM",
//       "replyMessage": "Polite confirmation for removing the item",
//       "actions": [
//         { "menuItemId": "The exact ObjectId from the menu list", "name": "Item Name" }
//       ]
//     }

//     If the customer wants to DECREASE or REDUCE quantity (e.g., 'ek butter naan kam kar do'), return:
//     {
//       "type": "DECREASE_QUANTITY",
//       "replyMessage": "Polite confirmation for reducing quantity",
//       "actions": [
//         { "menuItemId": "The exact ObjectId from the menu list", "name": "Item Name", "quantity": 1 }
//       ]
//     }

//     If the customer wants to CLEAR THE WHOLE CART (e.g., 'sab hata do', 'cart khali kar do'), return:
//     {
//       "type": "CLEAR_CART",
//       "replyMessage": "I have cleared everything from your cart.",
//       "actions": []
//     }

//     CRITICAL: For ADD_ORDER type, you MUST include the correct 'price' of the item as a number based on the menu provided.`;

//     const fallbackModels = [
//       "gemini-2.5-flash",
//       "gemini-2.5-flash-lite",
//       "gemini-3.5-flash",
//       "gemini-pro",
//     ];

//     let aiResponse = null;
//     let usedModel = null;

//     for (const modelName of fallbackModels) {
//       try {
//         // console.log(`Attempting to use model: ${modelName}...`);

//         const model = genAI.getGenerativeModel({
//           model: modelName,
//           generationConfig: { responseMimeType: "application/json" },
//           systemInstruction: systemPrompt,
//         });

//         const result = await model.generateContent(userMessage);
//         aiResponse = result.response.text();
//         usedModel = modelName;

//         // console.log(`Success! Model used: ${usedModel}`);
//         break;
//       } catch (err) {
//         console.warn(
//           `${modelName} failed. Error: ${err.statusText || err.message}`,
//         );
//       }
//     }

//     if (!aiResponse) throw new Error("All Gemini models failed.");

//     res.status(200).json({
//       success: true,
//       usedModel: usedModel,
//       data: JSON.parse(aiResponse),
//     });
//   } catch (error) {
//     console.error("Critical Chatbot Error:", error);
//     res
//       .status(500)
//       .json({ success: false, message: "Chatbot is sleeping right now! 😔" });
//   }
// };

// exports.handleLandingChat = async (req, res) => {
//   try {
//     const { userMessage } = req.body;

//     const systemPrompt = `You are a polite, professional, and enthusiastic Sales & Support AI Assistant for "BhojanQR".
//     Your goal is to help restaurant owners understand the platform, convince them to register, and help general customers know how it works.

//     Here is the official information about BhojanQR you must use to answer questions:

//     1. What is BhojanQR?
//     It is a premium, QR-based contactless dining and restaurant management platform.

//     2. Benefits for Restaurant Owners (Why they should register):
//     - Zero printing costs for physical menus.
//     - Faster table turnovers and higher revenue.
//     - Live order tracking dashboard.
//     - Built-in 'AI Virtual Waiter' for their customers to answer menu queries.
//     - Waiter calling system directly from the customer's phone.

//     3. How owners can use it:
//     Register -> Setup Digital Menu -> Generate & Print QR codes for tables -> Customers scan and order -> Receive live orders on the Admin Dashboard.

//     4. Pricing / Charges:
//     - Currently, BhojanQR is 100% FREE to use! We want to help restaurants grow.
//     - In the future, we may introduce affordable premium subscription plans or a tiny per-transaction fee, but early adopters will always be valued.

//     5. Contact / Creator Details:
//     BhojanQR is built by an expert development team. For direct queries, support, or business tie-ups, please email the admin at: bhojanqr@gmail.com.

//     RULES FOR AI:
//     - Keep answers concise, sweet, and convincing.
//     - Use emojis to make it friendly.
//     - If someone asks something entirely unrelated to food, restaurants, or software, politely decline and say you only assist with BhojanQR inquiries.`;

//     const fallbackModels = [
//       "gemini-2.5-flash",
//       "gemini-2.5-flash-lite",
//       "gemini-pro",
//     ];

//     let aiResponse = null;

//     for (const modelName of fallbackModels) {
//       try {
//         let result;
//         if (modelName === "gemini-pro") {
//           const model = genAI.getGenerativeModel({ model: modelName });
//           const combinedPrompt = `${systemPrompt}\n\nUser: ${userMessage}`;
//           result = await model.generateContent(combinedPrompt);
//         } else {
//           const model = genAI.getGenerativeModel({
//             model: modelName,
//             systemInstruction: systemPrompt,
//           });
//           result = await model.generateContent(userMessage);
//         }

//         aiResponse = result.response.text();
//         break;
//       } catch (err) {
//         console.warn(`${modelName} failed.`);
//       }
//     }

//     if (!aiResponse) throw new Error("All Gemini models failed.");

//     res.status(200).json({ success: true, reply: aiResponse });
//   } catch (error) {
//     console.error("Landing Chatbot Error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Our support bot is currently busy. Please email us!",
//     });
//   }
// };

const { GoogleGenerativeAI } = require("@google/generative-ai");
const Restaurant = require("../models/Restaurant");
const Menu = require("../models/Menu");
const Order = require("../models/Order");
const redisClient = require("../config/redis");

// Initialize Gemini SDK
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.handleCustomerChat = async (req, res) => {
  try {
    const { restaurantId, userMessage } = req.body;

    // Fetch Restaurant Name with Redis Cache
    const restCacheKey = `chat_restaurant_name:${restaurantId}`;
    let restaurantName = await redisClient.get(restCacheKey);

    if (!restaurantName) {
      const restaurant =
        await Restaurant.findById(restaurantId).select("restaurantName");
      if (!restaurant) {
        throw new Error("Restaurant not found");
      }
      restaurantName = restaurant.restaurantName;
      await redisClient.setEx(restCacheKey, 86400, restaurantName); // Cache for 24 hours
    }

    // Fetch and Format Menu Data with Redis Cache
    const menuCacheKey = `chat_menu_data:${restaurantId}`;
    let menuData = await redisClient.get(menuCacheKey);

    if (!menuData) {
      // Only fetch active and available items to prevent AI from selling out-of-stock food
      const menuItems = await Menu.find({
        restaurant: restaurantId,
        isDeleted: false,
        available: true,
      });

      // Including exact database _id so the AI can return it for cart operations
      menuData = menuItems
        .map(
          (item) =>
            `[ID: ${item._id}] ${item.name} - ₹${item.price} (${item.category}): ${item.description}`,
        )
        .join("\n");

      await redisClient.setEx(menuCacheKey, 1800, menuData); // Cache for 30 minutes
    }

    // Order Context Handling (Dynamic, bypassing cache for real-time accuracy)
    let orderContext = "";
    const orderIdMatch = userMessage.match(/pay_[a-zA-Z0-9]+/i);

    if (orderIdMatch) {
      const tokenNo = orderIdMatch[0];

      const order = await Order.findOne({
        restaurant: restaurantId,
        razorpayPaymentId: tokenNo,
      }).populate("items.menuItem");

      if (order) {
        orderContext = `
        IMPORTANT LIVE DATA: The customer is asking about their order. 
        Here are the exact details for Payment ID: ${tokenNo}:
        - Customer Name: ${order.customerName}
        - Status: ${order.status}
        - Total Price: ₹${order.totalPrice}
        - Payment Status: ${order.paymentStatus}
        - Cancellation Reason: ${order.cancellationReason ? order.cancellationReason : "Not specified"}
        
        INSTRUCTION FOR YOU: 
        If the status is "Cancelled", you MUST address the customer by their Name. Inform them politely about the cancellation, mention the specific Cancellation Reason, and assure them about their Payment Status (e.g., Refunded).`;
      } else {
        orderContext = `
        IMPORTANT LIVE DATA: The customer mentioned Payment ID ${tokenNo}, but no such active order was found in the system right now. Politely ask them to verify their ID.`;
      }
    }

    // Advanced Bilingual System Prompt
    const systemPrompt = `You are a highly advanced Bilingual AI Virtual Waiter for ${restaurantName}.
    Here is the exact menu available right now:
    ${menuData}

    ${orderContext}

    CRITICAL LANGUAGE RULES:
    1. Detect the language of the user's message (English or Hindi/Hinglish).
    2. If the user writes/speaks in English, your "replyMessage" MUST be entirely in English.
    3. If the user writes/speaks in Hindi (Devanagari or Roman script), your "replyMessage" MUST be entirely in Hindi (using Devanagari script for pure Hindi or clean conversational Hindi text).
    4. Match the language perfectly for both text and tone.

    CRITICAL INSTRUCTION: You MUST ALWAYS reply in strict JSON format. Never output plain text outside the JSON.
    
    If the customer is just chatting, return:
    {
      "type": "CHAT",
      "replyMessage": "Conversational reply in the user's language",
      "actions": []
    }

    If the customer wants to ADD an item to order/cart, return:
    {
      "type": "ADD_ORDER",
      "replyMessage": "Confirmation message in the user's language",
      "actions": [
        { "menuItemId": "The exact ObjectId from the menu list", "name": "Item Name", "quantity": 1, "price": 150 }
      ]
    }

    If the customer wants to REMOVE or DELETE an item completely, return:
    {
      "type": "REMOVE_ITEM",
      "replyMessage": "Confirmation message in the user's language",
      "actions": [
        { "menuItemId": "The exact ObjectId from the menu list", "name": "Item Name" }
      ]
    }

    If the customer wants to DECREASE or REDUCE quantity, return:
    {
      "type": "DECREASE_QUANTITY",
      "replyMessage": "Confirmation message in the user's language",
      "actions": [
        { "menuItemId": "The exact ObjectId from the menu list", "name": "Item Name", "quantity": 1 }
      ]
    }

    If the customer wants to CLEAR THE WHOLE CART, return:
    {
      "type": "CLEAR_CART",
      "replyMessage": "Confirmation message in the user's language",
      "actions": []
    }
    
    CRITICAL: For ADD_ORDER type, you MUST include the correct 'price' of the item as a number based on the menu provided.
    For ANY action (ADD, REMOVE, DECREASE), you MUST use the exact 'ID' provided in the menu list for 'menuItemId'.`;

    // Updated model list prioritizing the latest and fastest endpoints
    const fallbackModels = [
      "gemini-2.5-flash",
      "gemini-2.5-flash-lite",
      "gemini-3.5-flash",
    ];

    let aiResponse = null;
    let usedModel = null;

    for (const modelName of fallbackModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: { responseMimeType: "application/json" },
          systemInstruction: systemPrompt,
        });

        const result = await model.generateContent(userMessage);
        aiResponse = result.response.text();
        usedModel = modelName;
        break;
      } catch (err) {
        console.warn(`Model ${modelName} failed. Testing fallback...`);
      }
    }

    if (!aiResponse)
      throw new Error(
        "All Gemini models failed due to rate limits or network issues.",
      );

    res.status(200).json({
      success: true,
      usedModel: usedModel,
      data: JSON.parse(aiResponse),
    });
  } catch (error) {
    console.error("Critical Chatbot Error:", error.message);
    res.status(500).json({
      success: false,
      message:
        "Chatbot is processing too many requests. Please try again in a moment.",
    });
  }
};

exports.handleLandingChat = async (req, res) => {
  try {
    const { userMessage } = req.body;

    const systemPrompt = `You are a polite, professional, and enthusiastic Sales & Support AI Assistant for "BhojanQR". 
    Your goal is to help restaurant owners understand the platform, convince them to register, and help general customers know how it works.

    Here is the official information about BhojanQR you must use to answer questions:

    1. What is BhojanQR? 
    It is a premium, QR-based contactless dining and restaurant management platform. 

    2. Benefits for Restaurant Owners:
    - Zero printing costs for physical menus.
    - Faster table turnovers and higher revenue.
    - Live order tracking dashboard.
    - Built-in AI Virtual Waiter for customer queries.
    - Waiter calling system directly from the customer's phone.

    3. How owners can use it:
    Register -> Setup Digital Menu -> Generate QR codes for tables -> Customers scan and order -> Receive live orders on Dashboard.

    4. Pricing:
    - Currently 100% FREE to use. Early adopters will always be valued.

    5. Contact:
    For direct queries, support, or business tie-ups, please email the admin at: bhojanqr@gmail.com.

    RULES FOR AI:
    - Keep answers concise, sweet, and convincing.
    - If someone asks something entirely unrelated to food, restaurants, or software, politely decline and say you only assist with BhojanQR inquiries.`;

    const fallbackModels = [
      "gemini-2.5-flash",
      "gemini-2.5-flash-lite",
      "gemini-3.5-flash",
    ];

    let aiResponse = null;

    for (const modelName of fallbackModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: systemPrompt,
        });

        const result = await model.generateContent(userMessage);
        aiResponse = result.response.text();
        break;
      } catch (err) {
        console.warn(`Landing model ${modelName} failed.`);
      }
    }

    if (!aiResponse) throw new Error("All Gemini models failed.");

    res.status(200).json({ success: true, reply: aiResponse });
  } catch (error) {
    console.error("Landing Chatbot Error:", error.message);
    res.status(500).json({
      success: false,
      message:
        "Our support bot is currently busy. Please email us directly at bhojanqr@gmail.com",
    });
  }
};
