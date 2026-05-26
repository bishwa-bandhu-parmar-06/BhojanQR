import api from "./axiosInstance";

const BASE_URL = "/admin";

export const registerAdmin = (data) => {
  return api.post(`${BASE_URL}/register`, data);
};

export const loginAdmin = (data) => {
  return api.post(`${BASE_URL}/login`, data);
};

export const updateAdminProfile = (data) => {
  return api.post(`${BASE_URL}/edit-profile`, data);
};

export const getAdminProfile = () => {
  return api.get(`${BASE_URL}/profile`);
};

export const logoutAdmin = () => {
  return api.post(`${BASE_URL}/logout`);
};

// Get all restaurants with 'pending' status
export const getPendingRestaurants = () => {
  return api.get(`${BASE_URL}/restaurants/pending`);
};

// Get all restaurants with 'approved' status
export const getApprovedRestaurants = () => {
  return api.get(`${BASE_URL}/restaurants/approved`);
};

// Get all restaurants with 'rejected' status
export const getRejectedRestaurants = () => {
  return api.get(`${BASE_URL}/restaurants/rejected`);
};


// Universal status update (Approve, Reject, or move to Pending)
export const updateRestaurantStatus = (id, status) => {
  return api.post(`${BASE_URL}/restaurants/${id}/status`, { status });
};

// Get Full Analytics for Restaurant Dashboard Modal
export const getRestaurantDetailsAdmin = (id) => {
  return api.get(`${BASE_URL}/restaurants/${id}/details`);
};


// Fetch the public admin contact email for support pages
export const getPublicAdminContact = () => {
  return api.get(`${BASE_URL}/public/contact`);
};
