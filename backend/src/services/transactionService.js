const Transaction = require("../models/Transaction");

class TransactionService {
  async getUserTransactions(userId, page = 1, limit = 10) {
    // Calculate skip value for offset pagination
    const skip = (page - 1) * limit;

    // Fetch transactions for the user, latest first
    const transactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 }) // Descending order
      .skip(skip)
      .limit(limit);

    // Get total count for pagination metadata
    const totalRecords = await Transaction.countDocuments({ userId });
    const totalPages = Math.ceil(totalRecords / limit);

    return {
      transactions,
      pagination: {
        currentPage: page,
        totalPages,
        totalRecords,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async getTransactionDetails(userId, transactionId) {
    const transaction = await Transaction.findOne({
      _id: transactionId,
      userId: userId, // Security check: Ensure user only sees their own tx
    });

    if (!transaction) {
      throw new Error("Transaction not found or unauthorized");
    }

    return transaction;
  }
}

module.exports = new TransactionService();
