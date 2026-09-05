const atmService = require("../services/atmService");

class AtmController {
  async getInventory(req, res) {
    try {
      const inventory = await atmService.getInventory();
      res.status(200).json(inventory);
    } catch (error) {
      res.status(500).json({ status: false, message: error.message });
    }
  }

  async withdrawAmount(req, res) {
    try {
      const { amount, syncId } = req.body;
      const userId = req.user.id;

      const result = await atmService.processWithdrawal(userId, amount, syncId);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ status: false, message: error.message });
    }
  }

  async refillInventory(req, res) {
    try {
      const result = await atmService.refillATM();

      return res.status(200).json({
        status: true,
        message: "ATM refilled successfully",
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }
}

module.exports = new AtmController();
