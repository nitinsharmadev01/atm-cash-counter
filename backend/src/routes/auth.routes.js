const express = require("express");
const authController = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const {
  validateLogin,
  checkValidationErrors,
} = require("../middlewares/authValidator");
const router = express.Router();

router.post(
  "/login",
  validateLogin,
  checkValidationErrors,
  authController.login,
);
router.post("/logout", protect, authController.logout);
router.get("/me", protect, authController.getMe); // Protected route

module.exports = router;
