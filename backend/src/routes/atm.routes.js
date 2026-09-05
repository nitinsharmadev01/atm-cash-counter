const express = require("express");
const router = express.Router();
const atmController = require("../controllers/atmController");
const { protect } = require("../middlewares/authMiddleware");
const { validateWithdrawal } = require("../middlewares/atmValidator");
const { checkValidationErrors } = require("../middlewares/authValidator");

router.get("/inventory", protect, atmController.getInventory);
router.post(
  "/withdraw",
  protect,
  validateWithdrawal,
  checkValidationErrors,
  atmController.withdrawAmount,
);
router.post("/refill", protect, atmController.refillInventory);

module.exports = router;
