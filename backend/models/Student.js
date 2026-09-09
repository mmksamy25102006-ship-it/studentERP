const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
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
      uppercase: true,
    },

    year: {
      type: String,
      required: true,
      enum: ["I", "II", "III", "IV"],
    },

    cgpa: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },

    phone: {
      type: String,
      required: false,
      default: "",
      trim: true,
      match: /^$|^[0-9]{10}$/,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Student", studentSchema);