import api from "./axiosInstance";

const BASE_URL = "/menu";

export const getPublicMenu = (restaurantId) => {
  return api.get(`${BASE_URL}/public/${restaurantId}`);
};

export const getAllMenuItems = (page = 1, limit = 8) => {
  return api.get(`${BASE_URL}/all?page=${page}&limit=${limit}`);
};

export const getMyMenu = () => {
  return api.get(`${BASE_URL}/owner/my-menu`);
};

export const addMenuItem = (formDataToSend) => {
  return api.post(`${BASE_URL}/add`, formDataToSend, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const updateMenuItem = (id, formDataToSend) => {
  return api.post(`${BASE_URL}/update/${id}`, formDataToSend, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const updateMenuAvailability = (id) => {
  return api.post(`${BASE_URL}/${id}/availability`);
};

export const deleteMenuItem = (id) => {
  return api.post(`${BASE_URL}/${id}`);
};
