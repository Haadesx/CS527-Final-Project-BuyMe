const express = require('express');
const router = express.Router();
const { getNotifications, createNotification } = require('../controllers/notificationController');

router.get('/notification', getNotifications);
router.post('/notify', createNotification);

module.exports = router;
