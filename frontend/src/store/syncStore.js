import { create } from "zustand";
import { transactionDB } from "../db/transactions";

export const useSyncStore = create((set) => ({
  pendingCount: 0,
  isSyncing: false,
  syncErrors: [],

  updatePendingCount: async () => {
    const pending = await transactionDB.getPendingTransactions();
    set({ pendingCount: pending.length });
  },

  setSyncing: (status) => set({ isSyncing: status }),

  addSyncError: (error) =>
    set((state) => ({
      syncErrors: [...state.syncErrors, error],
    })),

  clearSyncErrors: () => set({ syncErrors: [] }),
}));
