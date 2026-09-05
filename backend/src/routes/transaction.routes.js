const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const transactionController = require("../controllers/transactionController");
const router = express.Router();

router.get("/", protect, transactionController.getTransactions);
router.get("/:id", protect, transactionController.getTransactionById);

module.exports = router;
