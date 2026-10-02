const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    postedBy: {
      type: String,
      default: "Faculty",
      trim: true,
    },

    // Faculty / admin ID that created the notice. Used to
    // let a sender list and manage only their own posts.
    facultyId: {
      type: String,
      default: "",
      trim: true,
    },

    // Notification type
    type: {
      type: String,
      enum: ["info", "success", "warning", "danger"],
      default: "info",
    },

    // Used for automatic unread notification count
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notification", NotificationSchema);