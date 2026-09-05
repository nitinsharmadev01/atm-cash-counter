import Dexie from "dexie";

export const db = new Dexie("AtmDatabase");

// Define schema for offline storage
db.version(1).stores({
  // Inventory table: Primary key is 'denomination'
  inventory: "denomination, quantity",

  // SyncQueue table: Primary key is 'syncId' for idempotency
  syncQueue: "syncId, amount, status, timestamp",
});
