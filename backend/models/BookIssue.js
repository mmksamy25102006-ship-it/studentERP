const mongoose = require("mongoose");

const bookIssueSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },

    // Kept so history stays readable if a book is renamed
    bookTitle: {
      type: String,
      required: true,
      trim: true,
    },

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

    issuedDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    dueDate: {
      type: Date,
      required: true,
    },

    returnedDate: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["issued", "returned"],
      default: "issued",
    },

    fine: {
      type: Number,
      default: 0,
      min: 0,
    },

    issuedBy: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("BookIssue", bookIssueSchema);
