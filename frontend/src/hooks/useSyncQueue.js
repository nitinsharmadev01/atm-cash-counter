import { useSyncStore } from "../store/syncStore";
import { transactionDB } from "../db/transactions";
import { withdrawAmount } from "../services/atmApi";
import { useNetworkStore } from "../store/networkStore";

export const useSyncQueue = () => {
  const setSyncing = useSyncStore((state) => state.setSyncing);
  const updatePendingCount = useSyncStore((state) => state.updatePendingCount);
  const addSyncError = useSyncStore((state) => state.addSyncError);
  const triggerInventoryRefresh = useNetworkStore(
    (state) => state.triggerInventoryRefresh,
  );

  const processSyncQueue = async () => {
    const pendingTxs = await transactionDB.getPendingTransactions();

    if (pendingTxs.length === 0) return;

    setSyncing(true);

    for (const tx of pendingTxs) {
      try {
        // Backend ko transaction bhejein with syncId[cite: 1]
        await withdrawAmount({
          amount: tx.amount,
          syncId: tx.syncId,
        });

        // Success hone par local Dexie se remove karein
        await transactionDB.removeSyncedTransaction(tx.syncId);
        triggerInventoryRefresh();
      } catch (error) {
        // PDF Req: Handle failed/conflicting transactions[cite: 1]
        addSyncError({
          syncId: tx.syncId,
          amount: tx.amount,
          message: error.response?.data?.message || "Sync failed",
        });
      }
    }

    await updatePendingCount(); // Store update karein UI ke liye
    setSyncing(false);
  };

  return { processSyncQueue };
};
