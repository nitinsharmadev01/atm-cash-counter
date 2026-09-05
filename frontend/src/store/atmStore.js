import { create } from "zustand";

export const useAtmStore = create((set) => ({
  inventory: [],
  totalBalance: 0,
  isLoading: false,

  setInventory: (inventoryData, balance) =>
    set({
      inventory: inventoryData,
      totalBalance: balance,
    }),

  setLoading: (status) => set({ isLoading: status }),
}));
