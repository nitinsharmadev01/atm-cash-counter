const transactionService = require("../services/transactionService");

class TransactionController {
  async getTransactions(req, res) {
    try {
      const userId = req.user.id; // From authMiddleware
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;

      const result = await transactionService.getUserTransactions(
        userId,
        page,
        limit,
      );

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ status: false, message: error.message });
    }
  }

  async getTransactionById(req, res) {
    try {
      const userId = req.user.id;
      const transactionId = req.params.id;

      const transaction = await transactionService.getTransactionDetails(
        userId,
        transactionId,
      );

      res.status(200).json(transaction);
    } catch (error) {
      // Agar error message 'not found' se related hai toh 404 bhejein
      if (error.message.includes("not found")) {
        return res.status(404).json({ status: false, message: error.message });
      }
      res.status(500).json({ status: false, message: error.message });
    }
  }
}

module.exports = new TransactionController();
