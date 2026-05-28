import api from "./axiosInstance";

const BASE_URL = "/restaurants";

export const registerRestaurant = (data) => {
  return api.post(`${BASE_URL}/register`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const loginRestaurant = (data) => {
  const response = api.post(`${BASE_URL}/login`, data);
  return response;
};

export const getRestaurantProfile = () => {
  return api.get(`${BASE_URL}/profile`);
};

export const updateRestaurantProfile = (data) => {
  return api.post(`${BASE_URL}/edit-profile`, data);
};

export const addRestaurantAddress = (data) => {
  return api.post(`${BASE_URL}/add-address`, data);
};

export const updateRestaurantAddress = (addressId, data) => {
  return api.post(`${BASE_URL}/update-address/${addressId}`, data);
};

export const deleteRestaurantAddress = (addressId) => {
  return api.post(`${BASE_URL}/delete-address/${addressId}`);
};

export const logoutRestaurant = () => {
  return api.post(`${BASE_URL}/logout`);
};

export const getDashboardStats = () => {
  return api.get(`${BASE_URL}/dashboard-stats`);
};

export const getSavedQRs = () => {
  return api.get(`${BASE_URL}/qr`);
};

export const generateAndSaveQRs = (tableNumbers) => {
  return api.post(`${BASE_URL}/qr/generate`, { tableNumbers });
};

export const deleteQR = (id) => {
  return api.post(`${BASE_URL}/qr/delete/${id}`);
};

// Fetch public restaurant details (Name and Email only)
export const getPublicRestaurantDetails = (id) => {
  return api.get(`${BASE_URL}/public/${id}`);
};


export const checkRestaurantStatus = () => {
  return api.get(`${BASE_URL}/check-status`);
};

export const validateTableNumber = (restaurantId, tableNumber) => {
  return api.get(`${BASE_URL}/public/${restaurantId}/validate-table?table=${tableNumber}`);
};