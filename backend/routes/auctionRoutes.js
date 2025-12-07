const express = require('express');
const router = express.Router();
const { getAuctions, getAuctionById, createAuction, updateAuction, deleteAuction, getAuctionParticipants, participateInAuction } = require('../controllers/auctionController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(getAuctions).post(protect, createAuction);
router.route('/:id').get(getAuctionById).put(protect, updateAuction).delete(protect, deleteAuction);
router.get('/participants/:id', protect, getAuctionParticipants);
router.post('/participate/:id', protect, participateInAuction);

module.exports = router;
