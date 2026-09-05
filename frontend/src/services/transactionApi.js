import api from "./api";

export const fetchTransactions = (page = 1, limit = 10) =>
  api.get(`/transactions?page=${page}&limit=${limit}`);
