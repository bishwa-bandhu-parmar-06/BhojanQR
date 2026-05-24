import api from "./axiosInstance";

const BASE_URL = "/service";

export const requestWaiterService = (data) => {
  return api.post(`${BASE_URL}/call`, data);
};

export const respondToWaiterCall = (requestId, data) => {
  return api.put(`${BASE_URL}/respond/${requestId}`, data);
};
