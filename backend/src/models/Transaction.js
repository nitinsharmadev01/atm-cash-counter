const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  transactionId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  dispensedNotes: { type: Map, of: Number, required: true },
  balanceBefore: { type: Number, required: true },
  balanceAfter: { type: Number, required: true },
  status: {
    type: String,
    enum: ["SUCCESS", "FAILED"],
    default: "SUCCESS",
  },
  syncStatus: {
    type: String,
    enum: ["PENDING", "SYNCED", "CONFLICT", "REALTIME"],
    default: "PENDING",
  },
  syncId: { type: String, sparse: true, unique: true }, // Offline duplicate prevention
  createdAt: { type: Date, default: Date.now },
});

transactionSchema.index({
  userId: 1,
  createdAt: -1,
});

transactionSchema.index({
  syncId: 1,
});
const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
