import api from "./api";

export const fetchInventory = () => api.get("/atm/inventory");
export const withdrawAmount = (payload) => api.post("/atm/withdraw", payload);
export const refillInventory = () => api.post("/atm/refill");
