const express = require("express");
const router = express.Router();

const Notification = require("../models/Notification");


// ========================================
// CREATE NOTIFICATION
// ========================================

router.post("/", async (req, res) => {
  try {

    const notification = await Notification.create({
      ...req.body,
      read: false,
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

router.get("/", async (req, res) => {
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
// GET UNREAD NOTIFICATION COUNT
// ========================================

router.get("/unread-count", async (req, res) => {
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

router.put("/:id/read", async (req, res) => {
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

router.put("/read-all", async (req, res) => {
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


module.exports = router;