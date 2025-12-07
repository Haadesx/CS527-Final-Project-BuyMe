const Notification = require('../models/Notification');

const getNotifications = async (req, res) => {
    // In a real app, we would filter by user ID from token
    // For now, let's just return all notifications or mock it if no auth in notification service yet
    // The frontend calls /notify/bid/notification
    const notifications = await Notification.find({}).sort({ timestamp: -1 });
    res.json(notifications);
};

const createNotification = async (req, res) => {
    const { user_id, message } = req.body;
    const notification = new Notification({
        user_id,
        message
    });
    const createdNotification = await notification.save();
    res.status(201).json(createdNotification);
};

module.exports = { getNotifications, createNotification };
