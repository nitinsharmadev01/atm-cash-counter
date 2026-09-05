// seeders/seed.js
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const AtmInventory = require("../models/AtmInventory");
const initialInventory = require("../constants/atmInventory");

async function runSeeder() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to Database");

    console.log("Clearing existing data...");
    await User.deleteMany();
    await AtmInventory.deleteMany();

    console.log("Seeding Users...");
    const salt = await bcrypt.genSalt(10);
    const passwordHash1 = await bcrypt.hash("123456", salt);
    const passwordHash2 = await bcrypt.hash("123456", salt);

    await User.insertMany([
      { email: "userA@gmail.com", password: passwordHash1 },
      { email: "userB@gmail.com", password: passwordHash2 },
    ]);
    console.log(
      "2 Users seeded successfully (userA@gmail.com & userB@gmail.com, Password: 123456)",
    );

    // 3. Seed ATM Inventory
    console.log("Seeding ATM Inventory...");
    await AtmInventory.insertMany(initialInventory);
    console.log("ATM Inventory seeded successfully (Total: ₹35,500)");

    console.log("Seeding Process Completed!");
    process.exit(0); // Success exit
  } catch (error) {
    console.error("Seeder Failed:", error);
    process.exit(1); // Failure exit
  }
}

runSeeder();
