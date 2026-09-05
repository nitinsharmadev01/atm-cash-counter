import { useState, useEffect, useCallback } from "react";
import { fetchTransactions } from "../services/transactionApi";

export const useTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTransactions = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetchTransactions(page, 10);
      setTransactions(response.data.transactions);
      setPagination({
        currentPage:
          response.data.pagination?.currentPage ||
          response.data.currentPage ||
          1,
        totalPages:
          response.data.pagination?.totalPages || response.data.totalPages || 1,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch transactions.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTransactions(1);
  }, [loadTransactions]);

  return { transactions, pagination, isLoading, error, loadTransactions };
};
