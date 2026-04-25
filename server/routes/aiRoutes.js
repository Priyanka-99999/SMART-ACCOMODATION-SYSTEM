const express = require('express');
const router = express.Router();
const { recommendProperties } = require('../controllers/aiController');

router.post('/recommend', recommendProperties);

module.exports = router;
