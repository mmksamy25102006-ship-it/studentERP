// backend/models/User.js

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["student", "faculty", "admin"],
      default: "student",
      required: true,
    },

    // -----------------------------------------
    // STUDENT / FACULTY UNIQUE IDENTIFIER
    // -----------------------------------------

    studentId: {
      type: String,
      trim: true,
      default: null,
      sparse: true,
    },

    facultyId: {
      type: String,
      trim: true,
      default: null,
      sparse: true,
    },

    // -----------------------------------------
    // COMMON USER INFORMATION
    // -----------------------------------------

    department: {
      type: String,
      default: "",
      trim: true,
    },

    year: {
      type: String,
      default: "",
      trim: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    // -----------------------------------------
    // FACULTY INFORMATION
    // -----------------------------------------

    designation: {
      type: String,
      default: "",
      trim: true,
    },

    // -----------------------------------------
    // HEAD OF DEPARTMENT
    //
    // The HOD is still a faculty member and logs in
    // through the faculty login. This flag is what
    // unlocks the HOD pages and the HOD approval
    // rights on top of the normal faculty ones.
    // -----------------------------------------

    isHod: {
      type: Boolean,
      default: false,
    },

    // -----------------------------------------
    // PRINCIPAL
    //
    // The principal is an ordinary faculty login - there is
    // no separate role in the login form - so the flag is
    // what unlocks the principal pages, the college wide
    // faculty leave queue and the right to countersign an
    // HOD's own leave.
    // -----------------------------------------

    isPrincipal: {
      type: Boolean,
      default: false,
    },

    experience: {
      type: String,
      default: "",
      trim: true,
    },

    // -----------------------------------------
    // PROFILE
    // -----------------------------------------

    profileImage: {
      type: String,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);