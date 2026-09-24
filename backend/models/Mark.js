const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
      trim: true,
    },

    credits: {
      type: Number,
      default: 3,
    },

    internal1: {
      type: Number,
      default: 0,
    },

    internal2: {
      type: Number,
      default: 0,
    },

    assignment: {
      type: Number,
      default: 0,
    },

    lab: {
      type: Number,
      default: 0,
    },

    grade: {
      type: String,
      default: "-",
    },

    gradePoints: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const markSchema = new mongoose.Schema(
  {
    rollNo: {
      type: String,
      required: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
    },

    semester: {
      type: String,
      required: true,
      default: "Semester I",
    },

    subjects: {
      type: [subjectSchema],
      default: [],
    },

    overallCGPA: {
      type: Number,
      default: 0,
    },

    predictedRank: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

/*
=========================================================
ONE STUDENT CAN HAVE MULTIPLE SEMESTERS

Example:

22CS002 + Semester I
22CS002 + Semester II
22CS002 + Semester III
...
22CS002 + Semester VI

But the same semester cannot be duplicated.
=========================================================
*/

markSchema.index(
  {
    rollNo: 1,
    semester: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model("Mark", markSchema);