const express = require('express');
const router = express.Router();
const { placeBid, getBidsByItem } = require('../controllers/bidController');
const { protect } = require('../middleware/authMiddleware');

router.post('/:itemId', protect, placeBid);
router.get('/:itemId', getBidsByItem);

module.exports = router;
