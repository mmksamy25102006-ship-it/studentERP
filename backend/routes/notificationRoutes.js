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
// PER-USER READ STATE
//
// Notices are a single broadcast collection shared by every
// signed-in user, so the old `read` boolean was shared too:
// the first person to hit "Mark all read" flipped it for the
// whole campus and everyone else's badge dropped to zero.
// readBy carries the ids of the people who have actually
// read a notice; `read` is only still consulted so notices
// written before readBy existed keep their old state.
// ========================================

const isReadBy = (notification, userId) =>
  notification.read === true ||
  (Array.isArray(notification.readBy) &&
    notification.readBy.includes(userId));


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
      category,
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

      // Drives the per-category switches in
      // Settings > Notifications. Unknown values fall back
      // to "notices" so a bad payload cannot fail the post.
      category: Notification.VALID_CATEGORIES.includes(category)
        ? category
        : "notices",

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

    const userId = String(req.user._id);

    // Notices this user cleared are dropped for them only,
    // so nobody else loses them. $ne also matches docs that
    // predate the field.
    const notifications = await Notification.find({
      dismissedBy: { $ne: userId },
    }).sort({ createdAt: -1 });

    // Same documents for everyone, but `read` is reported
    // from this requester's point of view. The id arrays are
    // dropped - they are per user bookkeeping and this list
    // is refetched every 30 seconds.
    res.json(
      notifications.map((notification) => {
        const plain = notification.toObject();

        plain.read = isReadBy(notification, userId);
        delete plain.readBy;
        delete plain.dismissedBy;

        return plain;
      })
    );

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

    // Own notifications PLUS legacy ones created before
    // the facultyId attribution existed (blank/missing),
    // so previously sent notices still show up here.
    const notifications = await Notification.find({
      $or: [
        { facultyId: String(req.params.facultyId).trim() },
        { facultyId: { $in: ["", null] } },
      ],
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

    const userId = String(req.user._id);

    const count = await Notification.countDocuments({
      // $ne matches missing fields too, so notices stored
      // before readBy existed still count as unread.
      read: { $ne: true },
      readBy: { $ne: userId },
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
          // Only this person is done with the notice. Setting
          // the shared `read` flag here is what used to wipe
          // everyone else's badge.
          $addToSet: {
            readBy: String(req.user._id),
          },
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

    // The stored flag is untouched, but for this caller the
    // notice is read now and the client uses this response.
    res.json({
      ...notification.toObject(),
      read: true,
    });

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

    const userId = String(req.user._id);

    const result = await Notification.updateMany(
      {
        // Only notices this caller has not read yet.
        readBy: { $ne: userId },
      },
      {
        $addToSet: {
          readBy: userId,
        },
      }
    );

    res.json({
      message: "All notifications marked as read",
      updated: result.modifiedCount || 0,
    });

  } catch (err) {

    res.status(500).json({
      message: err.message,
    });

  }
});


// ========================================
// CLEAR THE CALLER'S INBOX
//
// The Clear button used to empty React state only, which
// meant the 30 second poll put everything back. The ids are
// recorded per user instead, so clearing sticks and affects
// nobody else. Placed before "/:id" so the static path wins.
// ========================================

router.put(
  "/dismiss-all",
  verifyToken,
  async (req, res) => {
  try {

    const userId = String(req.user._id);

    await Notification.updateMany(
      {
        dismissedBy: { $ne: userId },
      },
      {
        $addToSet: {
          dismissedBy: userId,
          readBy: userId,
        },
      }
    );

    res.json({
      message: "Notifications cleared",
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
      category,
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

        // Keep the existing category when the edit request
        // does not send one, so editing the text of a notice
        // does not silently reset its area.
        category: Notification.VALID_CATEGORIES.includes(category)
          ? category
          : notification.category || "notices",
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