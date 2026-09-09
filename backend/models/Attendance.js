const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    // Student identification
    studentId: {
      type: String,
      required: true,
      trim: true,
    },

    rollNo: {
      type: String,
      trim: true,
      default: "",
    },

    name: {
      type: String,
      trim: true,
      default: "",
    },

    // Subject for this period
    subject: {
      type: String,
      trim: true,
      required: true,
    },

    // Attendance date: YYYY-MM-DD
    date: {
      type: String,
      required: true,
      trim: true,
    },

    // Class period: 1, 2, 3, 4...
    period: {
      type: Number,
      required: true,
      min: 1,
    },

    // Attendance status
    status: {
      type: String,
      enum: ["Present", "Absent"],
      required: true,
    },

    // Faculty information
    markedBy: {
      type: String,
      trim: true,
      default: "",
    },

    facultyId: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

/*
=========================================================
IMPORTANT

One attendance record belongs to:

Student
+
Date
+
Period
+
Subject

Example:

STU001
2026-09-06
Period 5
Mathematics

This prevents Period 5 from overwriting Period 6.
=========================================================
*/

attendanceSchema.index(
  {
    studentId: 1,
    date: 1,
    period: 1,
    subject: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model(
  "Attendance",
  attendanceSchema
);