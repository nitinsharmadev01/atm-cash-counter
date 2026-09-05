import { create } from "zustand";

export const useNetworkStore = create((set) => ({
  isOffline: !navigator.onLine,
  setOfflineStatus: (status) => set({ isOffline: status }),
}));
