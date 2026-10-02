const mongoose = require("mongoose");

// =========================================================
// Faculty leave and permission requests.
//
// The HOD is a faculty member, so a request here is filed
// by a facultyId and reviewed by whichever faculty account
// carries the isHod flag on the User record.
// =========================================================

const facultyRequestSchema = new mongoose.Schema(
  {
    // -----------------------------------------
    // TYPE
    // -----------------------------------------

    type: {
      type: String,
      enum: ["leave", "permission"],
      required: true,
    },

    // -----------------------------------------
    // APPLICANT
    // -----------------------------------------

    facultyId: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    facultyName: {
      type: String,
      trim: true,
      default: "",
    },

    department: {
      type: String,
      trim: true,
      default: "",
    },

    designation: {
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
        "Maternity Leave",
        "Earned Leave",
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
    // PERMISSION DETAILS
    // -----------------------------------------

    permissionType: {
      type: String,
      enum: [
        "On Duty",
        "Work From Home",
        "Late Arrival",
        "Early Departure",
        "Official Tour",
        "",
      ],
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
    // HOD DECISION
    // -----------------------------------------

    hodRemark: {
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
  },
  {
    timestamps: true,
  }
);

// One pending request per faculty per kind per day range
facultyRequestSchema.index({
  facultyId: 1,
  type: 1,
  status: 1,
  createdAt: -1,
});

module.exports = mongoose.model(
  "FacultyRequest",
  facultyRequestSchema
);
