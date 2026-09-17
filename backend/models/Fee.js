const mongoose = require("mongoose");

const feeSchema = new mongoose.Schema(
  {
    regNo: {
      type: String,
      required: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    department: {
      type: String,
      required: true,
      trim: true,
    },

    semester: {
      type: String,
      required: true,
      trim: true,
    },

    totalFee: {
      type: Number,
      required: true,
      min: 0,
    },

    paidFee: {
      type: Number,
      required: true,
      min: 0,
    },

    pendingFee: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["Paid", "Partial", "Unpaid"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Fee", feeSchema);