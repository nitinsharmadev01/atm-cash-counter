import { create } from "zustand";

export const useNetworkStore = create((set) => ({
  isOffline: !navigator.onLine,
  inventoryRefreshKey: 0,

  setOfflineStatus: (status) => set({ isOffline: status }),
  triggerInventoryRefresh: () =>
    set((state) => ({
      inventoryRefreshKey: state.inventoryRefreshKey + 1,
    })),
}));
