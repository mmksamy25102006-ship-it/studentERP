const mongoose = require("mongoose");

// Areas of the ERP a notice belongs to. Students pick which
// of these they want alerts for on the Settings page, so a
// notice has to say which area it concerns.
//
// Kept in sync with NOTIFICATION_CATEGORIES in
// src/context/NotificationPreferencesContext.jsx
const VALID_CATEGORIES = [
  "notices",
  "attendance",
  "marks",
  "fees",
  "assignments",
  "requests",
  "library",
];

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

    // Which area of the ERP this notice is about. Drives
    // the per-category switches in Settings > Notifications.
    // Optional so every notice created before this field
    // existed keeps working, defaulting to "notices".
    category: {
      type: String,
      enum: VALID_CATEGORIES,
      default: "notices",
    },

    // Used for automatic unread notification count
    //
    // Kept only for notices written before readBy existed.
    // It is a single shared flag, so it cannot be used for
    // the badge: the first student to hit "Mark all read"
    // would flip it for the whole campus.
    read: {
      type: Boolean,
      default: false,
    },

    // Ids of the users who have read this notice. This is
    // what the unread count and the bell badge are measured
    // against now, so reading a notice is scoped to the
    // person who read it.
    readBy: {
      type: [String],
      default: [],
      index: true,
    },

    // Ids of the users who cleared this notice out of their
    // inbox. Clear used to be a local wipe, so the notice
    // came straight back on the next 30 second poll.
    dismissedBy: {
      type: [String],
      default: [],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model(
  "Notification",
  NotificationSchema
);

Notification.VALID_CATEGORIES = VALID_CATEGORIES;

module.exports = Notification;