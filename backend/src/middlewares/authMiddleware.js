const jwt = require("jsonwebtoken");

const SESSION_EXPIRY = 10 * 60 * 1000; // 10 minutes

const protect = (req, res, next) => {
  // Read token from cookies
  const token = req.cookies.token;

  if (!token) {
    return res
      .status(401)
      .json({ message: "Not authorized, no session found" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request
    req.user = { id: decoded.id, email: decoded.email };

    // ROLLING SESSION LOGIC:
    // User is active, issue a fresh token for the next 10 minutes
    const newToken = jwt.sign(
      { id: decoded.id, email: decoded.email },
      process.env.JWT_SECRET,
      { expiresIn: "10m" },
    );

    // Update the cookie with the new token and refreshed expiry
    res.cookie("token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: SESSION_EXPIRY,
    });

    next();
  } catch (error) {
    // Token expired ya invalid hai
    return res
      .status(401)
      .json({ message: "Session expired, please login again" });
  }
};

module.exports = { protect };
