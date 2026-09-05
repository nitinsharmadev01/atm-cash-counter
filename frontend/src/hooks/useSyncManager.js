import { useState, useCallback } from "react";
import { transactionDB } from "../db/transactions";
import { withdrawAmount } from "../services/atmApi";
import { useSyncStore } from "../store/syncStore";
import { useNetworkStore } from "../store/networkStore";

export const useSyncManager = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const updatePendingCount = useSyncStore((state) => state.updatePendingCount);
  const isOffline = useNetworkStore((state) => state.isOffline);

  const processQueue = useCallback(async () => {
    console.log("isOffline", isOffline);
    if (isOffline) return;

    setIsSyncing(true);
    try {
      const pendingTxs = await transactionDB.getPendingTransactions();

      for (const tx of pendingTxs) {
        try {
          const response = await withdrawAmount({
            amount: tx.amount,
            syncId: tx.syncId,
          });

          // Handle conflict response from server (e.g., ATM ran out of cash while device was offline)[cite: 1]
          if (response.data && response.data.status === "CONFLICT") {
            await transactionDB.updateTransactionStatus(
              tx.syncId,
              "CONFLICT",
              response.data.message,
            );
          } else {
            // If successful (or already synced), remove from local queue
            await transactionDB.removeSyncedTransaction(tx.syncId);
          }
        } catch (error) {
          // Handle network or server errors during sync
          const errorMsg =
            error.response?.data?.message || "Network error during sync";
          await transactionDB.updateTransactionStatus(
            tx.syncId,
            "FAILED",
            errorMsg,
          );
        }
      }
    } finally {
      await updatePendingCount(); // Update Zustand badge count
      setIsSyncing(false);
    }
  }, [isOffline, updatePendingCount]);

  return { isSyncing, processQueue };
};
