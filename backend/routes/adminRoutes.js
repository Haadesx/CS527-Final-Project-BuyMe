const express = require('express');
const router = express.Router();
const { getEarningsReport } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.get('/report/earnings', protect, getEarningsReport);

module.exports = router;
