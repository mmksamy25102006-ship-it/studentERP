const Notification = require("../models/Notification");

// Send Notification
exports.sendNotification = async (req, res) => {

    try {

        const notification = await Notification.create(req.body);

        res.status(201).json({
            success: true,
            message: "Notification Sent Successfully",
            notification,
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message,
        });

    }

};

// Get Notifications
exports.getNotifications = async (req, res) => {

    try {

        const notifications = await Notification.find()
            .sort({ createdAt: -1 });

        res.status(200).json(notifications);

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message,
        });

    }

};