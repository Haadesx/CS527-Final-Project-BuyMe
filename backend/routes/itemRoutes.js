const express = require('express');
const router = express.Router();
const { createItem, addItemToAuction, getItemById, getAllItems, deleteItem, getItemsByAuctionId } = require('../controllers/itemController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(getAllItems).post(protect, createItem);
router.route('/:id').get(getItemById).delete(protect, deleteItem);
router.post('/auction/:auctionId/item/:itemId', protect, addItemToAuction);
router.get('/auction/:id', getItemsByAuctionId);

module.exports = router;
