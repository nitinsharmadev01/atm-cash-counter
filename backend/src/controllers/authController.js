const jwt = require("jsonwebtoken");
const authService = require("../services/authService");

// 10 minutes in milliseconds
const SESSION_EXPIRY = 10 * 60 * 1000;

class AuthController {
  async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await authService.authenticateUser(email, password);

      // Generate JWT Token with 10 minutes expiry
      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "10m" },
      );

      // Set Cookie securely
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict", // Protects against CSRF
        maxAge: SESSION_EXPIRY, // 10 minutes
      });

      res.status(200).json({
        status: true,
        message: "Login successful",
        user: { id: user._id, email: user.email },
      });
    } catch (error) {
      res.status(401).json({ status: false, message: error.message });
    }
  }

  async logout(req, res) {
    // Clear the cookie
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
    });
    res.status(200).json({ status: true, message: "Logged out successfully" });
  }

  async getMe(req, res) {
    // req.user is populated by the auth middleware
    res.status(200).json({ status: true, user: req.user });
  }
}

module.exports = new AuthController();
