const mongoose = require("mongoose");
const AtmInventory = require("../models/AtmInventory");
const { v4: uuidv4 } = require("uuid");
const Transaction = require("../models/Transaction");
const initialInventory = require("../constants/atmInventory");

class AtmService {
  _solveWithdrawal(amount, inventory, originalInventory) {
    if (amount === 0) return {};

    const denoms = Object.keys(inventory)
      .map(Number)
      .sort((a, b) => b - a);

    const INF = Infinity;

    let prevExhaustion = new Array(amount + 1).fill(INF);
    let prevNotes = new Array(amount + 1).fill(INF);
    let prevDepletion = new Array(amount + 1).fill(INF);

    prevExhaustion[0] = 0;
    prevNotes[0] = 0;
    prevDepletion[0] = 0;

    const choiceTables = [];

    for (let i = 0; i < denoms.length; i++) {
      const denom = denoms[i];

      const cap = Math.max(0, inventory[denom] || 0);

      // Original/full stock is used only for depletion calculation.
      const originalQty = originalInventory[denom] || 1;

      // Exhaustion is judged against CURRENT live stock.
      const realStock = inventory[denom] || 0;

      const currentExhaustion = new Array(amount + 1).fill(INF);
      const currentNotes = new Array(amount + 1).fill(INF);
      const currentDepletion = new Array(amount + 1).fill(INF);

      const currentChoice = new Array(amount + 1).fill(0);

      for (let currentAmount = 0; currentAmount <= amount; currentAmount++) {
        const maxCount = Math.min(cap, Math.floor(currentAmount / denom));

        let bestExhaustion = INF;
        let bestNotes = INF;
        let bestDepletion = INF;
        let bestCount = 0;

        // Larger count first.
        // Since we only replace when solution is strictly better,
        // this naturally prefers higher denominations on final ties.
        for (let count = maxCount; count >= 0; count--) {
          const remaining = currentAmount - count * denom;

          if (prevNotes[remaining] === INF) {
            continue;
          }

          // Does this choice completely drain current stock?
          const fullyExhausts = realStock > 0 && count === realStock ? 1 : 0;

          const exhaustion = prevExhaustion[remaining] + fullyExhausts;

          const notes = prevNotes[remaining] + count;

          const depletion = prevDepletion[remaining] + count / originalQty;

          const better =
            exhaustion < bestExhaustion ||
            (exhaustion === bestExhaustion &&
              (notes < bestNotes ||
                (notes === bestNotes && depletion < bestDepletion)));

          if (better) {
            bestExhaustion = exhaustion;
            bestNotes = notes;
            bestDepletion = depletion;
            bestCount = count;
          }
        }

        currentExhaustion[currentAmount] = bestExhaustion;
        currentNotes[currentAmount] = bestNotes;
        currentDepletion[currentAmount] = bestDepletion;
        currentChoice[currentAmount] = bestCount;
      }

      choiceTables.push(currentChoice);

      prevExhaustion = currentExhaustion;
      prevNotes = currentNotes;
      prevDepletion = currentDepletion;
    }

    // No exact combination exists.
    if (prevNotes[amount] === INF) {
      return null;
    }

    // Reconstruct solution.
    const result = {};
    let remainingAmount = amount;

    for (let i = denoms.length - 1; i >= 0; i--) {
      const denom = denoms[i];

      const count = choiceTables[i][remainingAmount];

      if (count > 0) {
        result[denom] = count;
      }

      remainingAmount -= count * denom;
    }

    return result;
  }

  _findBestWithdrawal(amount, inventory) {
    // Snapshot current inventory.
    const originalInventory = { ...inventory };

    // First: find globally best valid combination.
    const primary = this._solveWithdrawal(amount, inventory, originalInventory);

    if (primary === null) {
      return null;
    }

    let chosen = primary;

    const usedDenoms = Object.keys(chosen)
      .map(Number)
      .filter((denom) => chosen[denom] > 0);

    // Already a mixed denomination solution.
    if (usedDenoms.length > 1) {
      return chosen;
    }

    // Primary solution is single denomination.
    // Try to force at least one note of another denomination.
    const soloDenom = usedDenoms[0];
    const soloCount = chosen[soloDenom];

    const alternativeCaps = { ...inventory };

    // Prevent the same single-denomination solution.
    alternativeCaps[soloDenom] = soloCount - 1;

    const alternative = this._solveWithdrawal(
      amount,
      alternativeCaps,
      originalInventory,
    );

    if (alternative !== null) {
      chosen = alternative;
    }

    return chosen;
  }
  async getInventory() {
    const inventory = await AtmInventory.find().sort({ denomination: -1 });
    let totalBalance = 0;
    inventory.forEach(
      (item) => (totalBalance += item.denomination * item.quantity),
    );
    return { inventory, totalBalance };
  }

  async processWithdrawal(userId, amount, syncId = null) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Idempotency check: Prevent duplicate offline transactions
      if (syncId) {
        const existingTx = await Transaction.findOne({ syncId }).session(
          session,
        );
        if (existingTx) {
          await session.abortTransaction();
          session.endSession();
          return existingTx; // Already processed
        }
      }

      // 2. Lock inventory for update to avoid race conditions
      const inventory = await AtmInventory.find()
        .sort({ denomination: -1 })
        .session(session);

      let totalBalance = 0;
      let availableNotes = {};

      inventory.forEach((item) => {
        totalBalance += item.denomination * item.quantity;
        availableNotes[Number(item.denomination)] = item.quantity;
      });

      const transactionId = "TXN-" + uuidv4().substring(0, 8).toUpperCase();

      // 3. Offline Conflict Handling for Insufficient Balance
      if (amount > totalBalance) {
        if (syncId) {
          // Record as CONFLICT for offline sync tracking instead of just throwing error
          const failedTx = new Transaction({
            transactionId,
            userId,
            amount,
            dispensedNotes: {},
            balanceBefore: totalBalance,
            balanceAfter: totalBalance,
            status: "FAILED",
            syncStatus: "CONFLICT",
            syncId,
          });
          await failedTx.save({ session });
          await session.commitTransaction();
          session.endSession();

          return {
            status: "CONFLICT",
            message: "Insufficient ATM balance during offline synchronization.",
            transactionId,
          };
        }
        throw new Error("Insufficient ATM balance");
      }

      const finalDispensed = this._findBestWithdrawal(amount, availableNotes);
      // // ==========================================
      // // ALGORITHM: Greedy Mix + DFS Backtracking
      // // ==========================================
      // const denoms = inventory
      //   .map((item) => Number(item.denomination))
      //   .sort((a, b) => b - a);
      // let baseDispensed = {};
      // let remainingForMix = amount;
      // let tempAvailable = { ...availableNotes };

      // // Pass 1: Greedy Approach to reserve a mix of denominations
      // for (const denom of denoms) {
      //   if (tempAvailable[denom] > 0 && remainingForMix >= denom) {
      //     // Prefer 1 note for >= 500, and up to 2 notes for smaller denoms to ensure a mix
      //     const targetMix = denom >= 500 ? 1 : 2;
      //     const notesToTake = Math.min(
      //       Math.floor(remainingForMix / denom),
      //       tempAvailable[denom],
      //       targetMix,
      //     );

      //     if (notesToTake > 0) {
      //       baseDispensed[denom] = notesToTake;
      //       remainingForMix -= notesToTake * denom;
      //       tempAvailable[denom] -= notesToTake;
      //     }
      //   }
      // }

      // // Pass 2: Pure DFS Backtracking helper function
      // const findCombination = (remaining, availableLimits) => {
      //   const dfs = (rem, denomIndex) => {
      //     if (rem === 0) return {};
      //     if (denomIndex >= denoms.length) return null;

      //     const denom = denoms[denomIndex];
      //     const maxNotes = Math.min(
      //       Math.floor(rem / denom),
      //       availableLimits[denom],
      //     );

      //     for (let count = maxNotes; count >= 0; count--) {
      //       const nextRem = rem - count * denom;
      //       const result = dfs(nextRem, denomIndex + 1);

      //       if (result !== null) {
      //         if (count > 0) result[denom] = count;
      //         return result;
      //       }
      //     }
      //     return null;
      //   };
      //   return dfs(remaining, 0);
      // };

      // let finalDispensed = null;

      // // Try DFS with the remaining amount after our greedy mix
      // const dfsResult = findCombination(remainingForMix, tempAvailable);

      // if (dfsResult) {
      //   finalDispensed = { ...baseDispensed };
      //   for (const [d, c] of Object.entries(dfsResult)) {
      //     finalDispensed[d] = (finalDispensed[d] || 0) + c;
      //   }
      // } else {
      //   // Fallback: If the mix ruined the exact change, reset and run pure DFS for the full amount
      //   finalDispensed = findCombination(amount, availableNotes);
      // }

      // 4. Offline Conflict Handling for Impossible Exact Change
      if (!finalDispensed) {
        if (syncId) {
          const failedTx = new Transaction({
            transactionId,
            userId,
            amount,
            dispensedNotes: {},
            balanceBefore: totalBalance,
            balanceAfter: totalBalance,
            status: "FAILED",
            syncStatus: "CONFLICT",
            syncId,
          });
          await failedTx.save({ session });
          await session.commitTransaction();
          session.endSession();

          return {
            status: "CONFLICT",
            message:
              "Cannot dispense exact amount with available inventory during offline sync.",
            transactionId,
          };
        }
        throw new Error(
          "Cannot dispense exact amount with available denominations",
        );
      }

      // ==========================================
      // DATABASE UPDATES
      // ==========================================
      let totalNotesDispensed = 0;
      let totalDispensedValue = 0;

      for (const [denom, count] of Object.entries(finalDispensed)) {
        totalNotesDispensed += count;
        totalDispensedValue += Number(denom) * count;

        // Atomic update to ensure inventory hasn't changed negatively
        const result = await AtmInventory.updateOne(
          {
            denomination: Number(denom),
            quantity: { $gte: count },
          },
          {
            $inc: { quantity: -count },
          },
          { session },
        );

        if (result.modifiedCount !== 1) {
          throw new Error(
            "Concurrency Conflict: Inventory changed while processing.",
          );
        }
      }

      let transactionData = {
        transactionId,
        userId,
        amount,
        dispensedNotes: finalDispensed,
        balanceBefore: totalBalance,
        balanceAfter: totalBalance - amount,
        status: "SUCCESS",
        syncStatus: syncId ? "SYNCED" : "REALTIME", // Fixed mapping
      };
      if (syncId) {
        transactionData.syncId = syncId;
      }
      // 5. Corrected Schema Mapping for Transaction
      const transactionRecord = new Transaction(transactionData);

      await transactionRecord.save({ session });

      // Commit the transaction - Data is safe!
      await session.commitTransaction();
      session.endSession();

      return {
        amountWithdrawn: amount,
        notesDispensed: finalDispensed,
        numberOfNotesDispensed: totalNotesDispensed,
        totalValueOfDispensedNotes: totalDispensedValue,
        previousBalance: totalBalance,
        updatedBalance: totalBalance - amount,
        transactionId: transactionRecord.transactionId,
        status: transactionRecord.status,
      };
    } catch (error) {
      // Rollback EVERYTHING if any error occurs
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  async refillATM() {
    await AtmInventory.deleteMany({});

    const inventory = await AtmInventory.insertMany(initialInventory);

    const totalBalance = inventory.reduce(
      (total, item) => total + item.denomination * item.quantity,
      0,
    );

    return {
      inventory,
      totalBalance,
    };
  }
}

module.exports = new AtmService();
