import { db } from "./dexie";

export const transactionDB = {
  // Inventory Management[cite: 1]
  saveInventoryLocally: async (inventoryArray) => {
    await db.inventory.clear(); // Purani state hatao
    await db.inventory.bulkAdd(inventoryArray);
  },

  getLocalInventory: async () => {
    return await db.inventory.toArray();
  },

  updateLocalInventory: async (dispensedNotes) => {
    // dispensedNotes format: { "2000": 1, "500": 2 }
    await db.transaction("rw", db.inventory, async () => {
      for (const [denom, count] of Object.entries(dispensedNotes)) {
        const record = await db.inventory.get(Number(denom));
        if (record) {
          await db.inventory.put({
            denomination: record.denomination,
            quantity: record.quantity - count,
          });
        }
      }
    });
  },

  // Offline Transaction Queue[cite: 1]
  queueTransaction: async (transactionData) => {
    await db.syncQueue.add({
      ...transactionData,
      status: "PENDING",
      timestamp: Date.now(),
    });
  },

  getPendingTransactions: async () => {
    return await db.syncQueue.where("status").equals("PENDING").toArray();
  },

  // New: Fetch everything in the queue (Pending, Failed, Conflicted)
  getAllQueuedTransactions: async () => {
    return await db.syncQueue.orderBy("timestamp").reverse().toArray();
  },

  // New: Update status if a sync fails due to conflict
  updateTransactionStatus: async (syncId, newStatus, errorMessage) => {
    await db.syncQueue.update(syncId, {
      status: newStatus,
      error: errorMessage,
    });
  },

  removeSyncedTransaction: async (syncId) => {
    await db.syncQueue.delete(syncId);
  },

  clearSyncQueue: async () => {
    await db.syncQueue.clear();
  },
};
