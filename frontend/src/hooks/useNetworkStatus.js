import { useEffect } from "react";
import { useNetworkStore } from "../store/networkStore";
import { useSyncQueue } from "./useSyncQueue";
import { useSyncManager } from "./useSyncManager";

export const useNetworkStatus = () => {
  const setOfflineStatus = useNetworkStore((state) => state.setOfflineStatus);
  // const triggerInventoryRefresh = useNetworkStore(
  //   (state) => state.triggerInventoryRefresh,
  // );

  const { processSyncQueue } = useSyncQueue();
  // const { processQueue } = useSyncManager();

  useEffect(() => {
    const handleOnline = () => {
      console.log("useNetworkStatus called");
      setOfflineStatus(false);
      processSyncQueue(); // PDF Req: Auto-sync when internet is restored[cite: 1]
      // triggerInventoryRefresh();

      // processQueue();
    };
    const handleOffline = () => setOfflineStatus(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [setOfflineStatus, processSyncQueue]);
};
