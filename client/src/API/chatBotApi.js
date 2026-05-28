import api from "./axiosInstance";

const BASE_URL = "/chat";

export const sendMessageToAI = async (restaurantId, message) => {
  try {
    console.log("message : ", message);
    const res = await api.post(`${BASE_URL}/ask`, {
      restaurantId: restaurantId,
      userMessage: message,
    });
    console.log("Res : ", res);
    return res.data;
  } catch (error) {
    console.error("Error in AI chat:", error);
    throw error;
  }
};

export const sendLandingChatMessage = async (message) => {
  try {
    const res = await api.post(`${BASE_URL}/support`, {
      userMessage: message,
    });
    return res.data;
  } catch (error) {
    console.error("Error in Landing AI chat:", error);
    throw error;
  }
};
