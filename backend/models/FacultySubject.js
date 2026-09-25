const mongoose = require("mongoose");

const facultySubjectSchema = new mongoose.Schema(
  {
    facultyId: {
      type: String,
      required: true,
      trim: true,
    },

    facultyName: {
      type: String,
      default: "",
      trim: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    semester: {
      type: String,
      required: true,
      enum: [
        "Semester I",
        "Semester II",
        "Semester III",
        "Semester IV",
        "Semester V",
        "Semester VI",
      ],
    },

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

    section: {
      type: String,
      default: "",
      trim: true,
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

facultySubjectSchema.index(
  {
    facultyId: 1,
    subject: 1,
    semester: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model(
  "FacultySubject",
  facultySubjectSchema
);