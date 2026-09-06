import { useState, useEffect, useCallback } from "react";
import { fetchInventory } from "../services/atmApi";
import { transactionDB } from "../db/transactions";
import { useNetworkStore } from "../store/networkStore";

export const useInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [walletResponse, setWalletResponse] = useState(null);

  const isOffline = useNetworkStore((state) => state.isOffline);
  const inventoryRefreshKey = useNetworkStore(
    (state) => state.inventoryRefreshKey,
  );

  const loadInventory = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      if (isOffline) {
        // PDF Req: Continue working offline based on local inventory
        const localData = await transactionDB.getLocalInventory();
        if (localData.length > 0) {
          calculateAndSet(localData);
        } else {
          setError("Offline: No local inventory data found.");
        }
      } else {
        // Fetch from API
        const response = await fetchInventory();
        const apiInventory = response.data.inventory;
        setWalletResponse(response.data);
        // Cache for offline use
        await transactionDB.saveInventoryLocally(apiInventory);
        calculateAndSet(apiInventory);
      }
    } catch (err) {
      console.error("Failed to load inventory", err);
      // setError("Failed to fetch ATM inventory. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [isOffline]);

  const calculateAndSet = (data) => {
    let balance = 0;
    const sortedData = data.sort((a, b) => b.denomination - a.denomination);
    sortedData.forEach((item) => {
      balance += item.denomination * item.quantity;
    });
    setInventory(sortedData);
    setTotalBalance(balance);
  };

  useEffect(() => {
    loadInventory();
  }, [loadInventory, inventoryRefreshKey]);

  return {
    inventory,
    totalBalance,
    isLoading,
    error,
    refreshInventory: loadInventory,
    walletResponse,
  };
};
