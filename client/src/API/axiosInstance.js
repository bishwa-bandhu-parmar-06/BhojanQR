import axios from "axios";
import { store } from "../App/store.js";
import { logout } from "../Features/auth/AuthSlice.js";

const api = axios.create({
  // baseURL: import.meta.env.DEV ? "http://localhost:3000/api" : "/api",
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;

      if (status === 401) {
        console.log("Session expired or unauthorized. Redirecting...");

        store.dispatch(logout());

        const currentPath = window.location.pathname;

        if (currentPath.includes("/admin")) {
          window.location.href = "/admin/auth";
        } else if (currentPath.includes("/restaurant")) {
          window.location.href = "/restaurant/auth";
        } else {
          window.location.href = "/";
        }
      }

      if (status === 403) {
        console.log("Access forbidden");
      }
    }

    return Promise.reject(error);
  },
);

export default api;
