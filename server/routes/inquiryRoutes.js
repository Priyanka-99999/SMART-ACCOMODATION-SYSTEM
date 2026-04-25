const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createInquiry, getMyInquiries, updateInquiryStatus } = require('../controllers/inquiryController');

router.route('/')
  .post(protect, createInquiry)
  .get(protect, getMyInquiries);

router.route('/:id/status')
  .put(protect, updateInquiryStatus);

module.exports = router;
