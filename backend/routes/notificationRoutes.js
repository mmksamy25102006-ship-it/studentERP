const express = require("express");
const router = express.Router();

const Notification = require("../models/Notification");

const {
  verifyToken,
  isFacultyOrAdmin,
  isFaculty,
  ownsFaculty,
} = require("../middleware/authMiddleware");


// ========================================
// CREATE NOTIFICATION
// Only faculty and admin may post a notice.
// ========================================

router.post(
  "/",
  verifyToken,
  isFacultyOrAdmin,
  async (req, res) => {
  try {

    const {
      title,
      message,
      type,
    } = req.body;

    if (!title || !String(title).trim() || !message || !String(message).trim()) {
      return res.status(400).json({
        message: "Title and message are required",
      });
    }

    const notification = await Notification.create({
      title: String(title).trim(),
      message: String(message).trim(),
      type: ["info", "success", "warning", "danger"].includes(type)
        ? type
        : "info",
      read: false,

      // Attribution always comes from the token. Nothing in
      // the body is trusted, so a sender cannot forge a
      // notice as somebody else.
      postedBy: req.user.name || "Faculty",
      facultyId: req.user.facultyId || "",
    });

    res.status(201).json(notification);

  } catch (err) {

    res.status(500).json({
      message: err.message,
    });

  }
});


// ========================================
// GET ALL NOTIFICATIONS
// ========================================

router.get(
  "/",
  verifyToken,
  async (req, res) => {
  try {

    const notifications = await Notification.find()
      .sort({ createdAt: -1 });

    res.json(notifications);

  } catch (err) {

    res.status(500).json({
      message: err.message,
    });

  }
});


// ========================================
// GET MY NOTIFICATIONS
//
// Sits before "/unread-count" style static routes? No -
// "/unread-count" has no leading segment clash with
// "/faculty/:facultyId", but static routes must still win
// over this parameter path, so it stays after "/" and
// "/unread-count" definitions above. A faculty member only
// ever sees the notices they posted themselves.
// ========================================

router.get(
  "/faculty/:facultyId",
  verifyToken,
  isFaculty,
  ownsFaculty("facultyId"),
  async (req, res) => {
  try {

    const notifications = await Notification.find({
      facultyId: String(req.params.facultyId).trim(),
    }).sort({ createdAt: -1 });

    res.json(notifications);

  } catch (err) {

    res.status(500).json({
      message: err.message,
    });

  }
});


// ========================================
// DELETE MY NOTIFICATION
// ========================================

router.delete(
  "/:id",
  verifyToken,
  isFaculty,
  async (req, res) => {
  try {

    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    // Only the sender (or an admin) may delete a notice.
    // The sender identity is read from the token, never
    // from the request.
    const ownsNotice =
      notification.facultyId &&
      req.user.facultyId &&
      String(notification.facultyId).trim() ===
        String(req.user.facultyId).trim();

    if (!ownsNotice && req.user.role !== "admin") {
      return res.status(403).json({
        message: "You can only delete notifications you posted",
      });
    }

    await Notification.findByIdAndDelete(req.params.id);

    res.json({
      message: "Notification deleted",
    });

  } catch (err) {

    res.status(500).json({
      message: err.message,
    });

  }
});


// ========================================
// GET UNREAD NOTIFICATION COUNT
// ========================================

router.get(
  "/unread-count",
  verifyToken,
  async (req, res) => {
  try {

    const count = await Notification.countDocuments({
      read: false,
    });

    res.json({
      count,
    });

  } catch (err) {

    res.status(500).json({
      message: err.message,
    });

  }
});


// ========================================
// MARK ONE NOTIFICATION AS READ
// ========================================

router.put(
  "/:id/read",
  verifyToken,
  async (req, res) => {
  try {

    const notification =
      await Notification.findByIdAndUpdate(
        req.params.id,
        {
          read: true,
        },
        {
          new: true,
        }
      );

    if (!notification) {

      return res.status(404).json({
        message: "Notification not found",
      });

    }

    res.json(notification);

  } catch (err) {

    res.status(500).json({
      message: err.message,
    });

  }
});


// ========================================
// MARK ALL NOTIFICATIONS AS READ
// ========================================

router.put(
  "/read-all",
  verifyToken,
  async (req, res) => {
  try {

    await Notification.updateMany(
      {
        read: false,
      },
      {
        $set: {
          read: true,
        },
      }
    );
res.json({
      message: "All notifications marked as read",
    });

  } catch (err) {

    res.status(500).json({
      message: err.message,
    });

  }
});


// ========================================
// UPDATE (EDIT) MY NOTIFICATION
//
// Placed after "/read-all" on purpose, so the ":id"
// parameter does not shadow that static route.
// ========================================

router.put(
  "/:id",
  verifyToken,
  isFacultyOrAdmin,
  async (req, res) => {
  try {

    const notification =
      await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    // Only the sender (or an admin) may edit a notice.
    const ownsNotice =
      notification.facultyId &&
      req.user.facultyId &&
      String(notification.facultyId).trim() ===
        String(req.user.facultyId).trim();

    if (!ownsNotice && req.user.role !== "admin") {
      return res.status(403).json({
        message: "You can only edit notifications you posted",
      });
    }

    const {
      title,
      message,
      type,
    } = req.body;

    if (!title || !String(title).trim() || !message || !String(message).trim()) {
      return res.status(400).json({
        message: "Title and message are required",
      });
    }

    const updated = await Notification.findByIdAndUpdate(
      req.params.id,
      {
        title: String(title).trim(),
        message: String(message).trim(),
        type: ["info", "success", "warning", "danger"].includes(type)
          ? type
          : notification.type || "info",
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.json(updated);

  } catch (err) {

    res.status(500).json({
      message: err.message,
    });

  }
});


module.exports = router;