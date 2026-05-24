import api from "./axiosInstance";

const BASE_URL = "/notifications";

export const getRestaurantNotifications = () => {
  return api.get(BASE_URL);
};

export const markAllNotificationsAsRead = () => {
  return api.put(`${BASE_URL}/read-all`);
};

export const markSingleNotificationAsRead = (id) => {
  return api.put(`${BASE_URL}/${id}/read`);
};

export const deleteSingleNotification = (id) => {
  return api.delete(`${BASE_URL}/${id}`);
};

export const deleteAllNotifications = () => {
  return api.delete(BASE_URL);
};
