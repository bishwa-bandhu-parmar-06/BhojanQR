import api from "./axiosInstance";

const BASE_URL = "/contact";

export const submitContactForm = (data) => {
  return api.post(`${BASE_URL}/submit`, data);
};
