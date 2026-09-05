const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const errorHandler = require("./middlewares/errorHandler");
const authRoutes = require("./routes/auth.routes");
const atmRoutes = require("./routes/atm.routes");
const transactionRoutes = require("./routes/transaction.routes");

const app = express();

app.use(helmet());

app.use(express.json());

app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    // origin: "*",
    credentials: true,
  }),
);
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server Running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/atm", atmRoutes);
app.use("/api/transactions", transactionRoutes);

app.use(errorHandler);

module.exports = app;
