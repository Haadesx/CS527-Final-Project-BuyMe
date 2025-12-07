const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    message: { type: String, required: true },
    is_read: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
}, {
    timestamps: true
});

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
