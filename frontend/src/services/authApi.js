import api from "./api";

export const loginUser = (credentials) => api.post("/auth/login", credentials);
export const logoutUser = () => api.post("/auth/logout");
export const getSessionUser = () => api.get("/auth/me");
