import api from "./axiosInstance";

const BASE_URL = "/contact";

export const submitContactForm = (data) => {
  const response = api.post(`${BASE_URL}/submit`, data);
  console.log("Response : ", response)
  return response;
};
