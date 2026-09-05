const mongoose = require("mongoose");

const atmInventorySchema = new mongoose.Schema(
  {
    denomination: {
      type: Number,
      required: true,
      unique: true,
      enum: [2000, 500, 200, 100, 50],
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

const AtmInventory = mongoose.model(
  "AtmInventory",
  atmInventorySchema,
  "atm_inventory",
);
module.exports = AtmInventory;
