const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, getBookings } = require('../controllers/bookingController');
const { protect, admin } = require('../middleware/auth');

router.route('/')
  .post(protect, createBooking)
  .get(protect, admin, getBookings);

router.route('/mybookings')
  .get(protect, getMyBookings);

module.exports = router;
