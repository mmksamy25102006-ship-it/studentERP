const mongoose = require("mongoose");

// =========================================================
// A single model covers both request kinds.
// "leave" uses fromDate / toDate / leaveType.
// "bonafide" uses purpose / certificateType.
// =========================================================

const studentRequestSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["leave", "bonafide"],
      required: true,
    },

    // -----------------------------------------
    // STUDENT
    // -----------------------------------------

    studentId: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    studentName: {
      type: String,
      trim: true,
      default: "",
    },

    department: {
      type: String,
      trim: true,
      default: "",
    },

    year: {
      type: String,
      trim: true,
      default: "",
    },

    // -----------------------------------------
    // LEAVE DETAILS
    // -----------------------------------------

    leaveType: {
      type: String,
      enum: [
        "Casual Leave",
        "Sick Leave",
        "Event Leave",
        "Emergency Leave",
        "",
      ],
      default: "Casual Leave",
    },

    fromDate: {
      type: Date,
      default: null,
    },

    toDate: {
      type: Date,
      default: null,
    },

    // -----------------------------------------
    // BONAFIDE DETAILS
    // -----------------------------------------

    certificateType: {
      type: String,
      trim: true,
      default: "",
    },

    purpose: {
      type: String,
      trim: true,
      default: "",
    },

    // -----------------------------------------
    // COMMON
    // -----------------------------------------

    reason: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
    },

    // -----------------------------------------
    // FACULTY DECISION
    // -----------------------------------------

    facultyRemark: {
      type: String,
      trim: true,
      default: "",
    },

    actionedBy: {
      type: String,
      trim: true,
      default: "",
    },

    actionedByName: {
      type: String,
      trim: true,
      default: "",
    },

    actionedAt: {
      type: Date,
      default: null,
    },

    // -----------------------------------------
    // BONAFIDE CERTIFICATE
    // Generated once the request is approved
    // -----------------------------------------

    certificateNumber: {
      type: String,
      trim: true,
      default: "",
    },

    issuedDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// One pending leave per student per day range
studentRequestSchema.index({
  studentId: 1,
  type: 1,
  status: 1,
  createdAt: -1,
});

module.exports = mongoose.model(
  "StudentRequest",
  studentRequestSchema
);
