import api from "./axiosInstance";

const BASE_URL = "/order";

export const createOrder = (data) => {
  return api.post(`${BASE_URL}/create-order`, data);
};

export const verifyPayment = (data) => {
  return api.post(`${BASE_URL}/verify-payment`, data);
};

export const getOrderByToken = (token) => {
  return api.get(`${BASE_URL}/status/${token}`);
};

export const getRestaurantOrders = () => {
  return api.get(`${BASE_URL}/hotel-orders`);
};

export const updateOrderStatus = (id, data) => {
  return api.put(`${BASE_URL}/${id}/status`, data);
};