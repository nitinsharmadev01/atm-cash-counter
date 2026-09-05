const { body, validationResult } = require("express-validator");

// 1. Validation Rules for Withdrawal
const validateWithdrawal = [
  body("amount")
    .exists()
    .withMessage("Amount is required.")
    .isNumeric()
    .withMessage("Amount must be a number.")
    .custom((value) => {
      const amount = Number(value);
      if (amount <= 0) {
        throw new Error("Amount must be greater than 0.");
      }
      if (amount % 50 !== 0) {
        throw new Error("Amount must be a multiple of 50.");
      }
      return true;
    }),

  body("syncId")
    .optional()
    .trim()
    .isString()
    .withMessage("syncId must be a string if provided."),
];

// 2. Generic Error Checker Middleware
const checkValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: false,
      message: errors.array()[0].msg, // Sending single clear message to frontend toast
      errors: errors.array(),
    });
  }
  next();
};

module.exports = {
  validateWithdrawal,
  checkValidationErrors,
};
