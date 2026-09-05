const User = require("../models/User");
const bcrypt = require("bcryptjs");

class AuthService {
  async authenticateUser(email, password) {
    // 1. Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("Invalid email or password");
    }

    console.log(user);
    // 2. Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Invalid email or password");
    }

    return user;
  }
}

module.exports = new AuthService();
