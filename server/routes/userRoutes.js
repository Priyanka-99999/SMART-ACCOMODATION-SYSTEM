const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { toggleWishlist, getWishlist } = require('../controllers/userController');

router.get('/wishlist', protect, getWishlist);
router.post('/wishlist/:id', protect, toggleWishlist);

module.exports = router;
