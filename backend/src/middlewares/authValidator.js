const { body, validationResult } = require("express-validator");

// 1. Validation Rules
const validateLogin = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Please provide a valid email address."),

  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required.")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long."),
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
  validateLogin,
  checkValidationErrors,
};
