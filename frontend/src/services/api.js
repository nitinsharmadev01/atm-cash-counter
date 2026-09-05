import axios from "axios";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

const baseURL = import.meta.env.API_URL || "http://localhost:3000/api";

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

api.interceptors.response.use(
  (response) => {
    // === GLOBAL SUCCESS HANDLER ===
    const { data, config } = response;

    // Agar status true hai, message aaya hai, aur request GET nahi hai
    if (data && data.status === true && data.message) {
      if (config.method !== "get") {
        toast.success(data.message);
      }
    }

    return response;
  },
  (error) => {
    // === GLOBAL ERROR HANDLER ===
    const { response, config } = error;

    if (!response) {
      toast.error("Network connection error. Check your internet.");
      return Promise.reject(error);
    }

    const backendMessage =
      response.data?.message || "An unexpected error occurred.";

    if (response.status === 401) {
      const isLoginRequest = config.url.includes("/auth/login");
      const authState = useAuthStore.getState();
      if (isLoginRequest) {
        toast.error(backendMessage);
      } else if (authState.isAuthenticated) {
        toast.error("Session expired. Please log in again.");
        authState.logout();
        window.location.href = "/login";
      }
    } else if (response.status === 429) {
      toast.error("Too many requests. Please wait a moment.");
    } else if (response.status >= 500) {
      toast.error("Server error. Our team has been notified.");
    } else {
      toast.error(backendMessage);
    }

    return Promise.reject(error);
  },
);

export default api;
