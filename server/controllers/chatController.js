const { GoogleGenerativeAI } = require("@google/generative-ai");
const Restaurant = require("../models/Restaurant");
const Menu = require("../models/Menu");
const Order = require("../models/Order");

// Initialize Gemini SDK
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.handleCustomerChat = async (req, res) => {
  try {
    const { restaurantId, userMessage } = req.body;

    const restaurant = await Restaurant.findById(restaurantId);
    const menuItems = await Menu.find({ restaurant: restaurantId });

    const menuData = menuItems
      .map(
        (item) =>
          `${item.name} - ₹${item.price} (${item.category}): ${item.description}`,
      )
      .join("\n");

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
        If the status is "Cancelled", you MUST address the customer by their Name. Inform them politely about the cancellation, mention the specific Cancellation Reason, and assure them about their Payment Status (e.g., Refunded). 
        Make it sound empathetic, like: "I'm so sorry to inform you, [Name]..."`;
      } else {
        orderContext = `
        IMPORTANT LIVE DATA: The customer mentioned Payment ID ${tokenNo}, but no such active order was found in the system right now. Politely ask them to verify their ID.`;
      }
    }
    const systemPrompt = `You are a polite, helpful virtual waiter for a restaurant named ${restaurant.restaurantName}. 
    Here is the menu: 
    ${menuData}
    ${orderContext}
    
    RULES:
    - ONLY answer questions based on this menu or the live order details provided.
    - Do not answer any general knowledge, coding, or math questions. If a user asks something unrelated, politely say "I am a virtual waiter for ${restaurant.restaurantName}, I can only help you with our menu and your orders."
    - Keep your answers short, sweet, and conversational.`;

    const fallbackModels = [
      "gemini-3-flash",
      "gemini-2.5-flash",
      "gemini-2.5-flash-lite",
    ];

    let aiResponse = null;
    let usedModel = null;

    for (const modelName of fallbackModels) {
      try {
        console.log(`Attempting to use model: ${modelName}...`);

        let result;
        if (modelName === "gemini-pro") {
          const model = genAI.getGenerativeModel({ model: modelName });
          const combinedPrompt = `${systemPrompt}\n\nCustomer: ${userMessage}`;
          result = await model.generateContent(combinedPrompt);
        } else {
          const model = genAI.getGenerativeModel({
            model: modelName,
            systemInstruction: systemPrompt,
          });
          result = await model.generateContent(userMessage);
        }

        aiResponse = result.response.text();
        usedModel = modelName;

        console.log(`Success! Model used: ${usedModel}`);
        break;
      } catch (err) {
        console.warn(
          `${modelName} failed. Error: ${err.statusText || err.message}`,
        );
      }
    }

    if (!aiResponse) {
      throw new Error("All Gemini models failed to generate a response.");
    }

    res.status(200).json({
      success: true,
      usedModel: usedModel,
      reply: aiResponse,
    });
  } catch (error) {
    console.error("Critical Chatbot Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Chatbot is sleeping right now! 😔" });
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

    2. Benefits for Restaurant Owners (Why they should register):
    - Zero printing costs for physical menus.
    - Faster table turnovers and higher revenue.
    - Live order tracking dashboard.
    - Built-in 'AI Virtual Waiter' for their customers to answer menu queries.
    - Waiter calling system directly from the customer's phone.

    3. How owners can use it:
    Register -> Setup Digital Menu -> Generate & Print QR codes for tables -> Customers scan and order -> Receive live orders on the Admin Dashboard.

    4. Pricing / Charges:
    - Currently, BhojanQR is 100% FREE to use! We want to help restaurants grow.
    - In the future, we may introduce affordable premium subscription plans or a tiny per-transaction fee, but early adopters will always be valued.

    5. Contact / Creator Details:
    BhojanQR is built by an expert development team. For direct queries, support, or business tie-ups, please email the admin at: bhojanqr@gmail.com.

    RULES FOR AI:
    - Keep answers concise, sweet, and convincing.
    - Use emojis to make it friendly.
    - If someone asks something entirely unrelated to food, restaurants, or software, politely decline and say you only assist with BhojanQR inquiries.`;

    const fallbackModels = [
      "gemini-2.5-flash",
      "gemini-2.5-flash-lite",
      "gemini-pro",
    ];

    let aiResponse = null;

    for (const modelName of fallbackModels) {
      try {
        let result;
        if (modelName === "gemini-pro") {
          const model = genAI.getGenerativeModel({ model: modelName });
          const combinedPrompt = `${systemPrompt}\n\nUser: ${userMessage}`;
          result = await model.generateContent(combinedPrompt);
        } else {
          const model = genAI.getGenerativeModel({
            model: modelName,
            systemInstruction: systemPrompt,
          });
          result = await model.generateContent(userMessage);
        }

        aiResponse = result.response.text();
        break;
      } catch (err) {
        console.warn(`${modelName} failed.`);
      }
    }

    if (!aiResponse) throw new Error("All Gemini models failed.");

    res.status(200).json({ success: true, reply: aiResponse });
  } catch (error) {
    console.error("Landing Chatbot Error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Our support bot is currently busy. Please email us!",
      });
  }
};
