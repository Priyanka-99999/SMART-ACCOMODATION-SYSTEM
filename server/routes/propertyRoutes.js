const express = require('express');
const router = express.Router();
const { getProperties, getPropertyById, createProperty, updatePropertyStatus } = require('../controllers/propertyController');
const { protect, admin } = require('../middleware/auth');

// Note: getProperties needs optional auth check to allow admin/owner queries.
// We'll write a simple middleware for optional auth or just pass the token to the GET route conditionally on frontend.
// Actually, standard protect requires token. Let's make a custom middleware or just let frontend send token if it exists.
// Wait, `getProperties` does not use `protect` in the route, so `req.user` will be undefined unless we add a soft-auth middleware.
// Let's create an optional auth middleware.

const optionalProtect = require('../middleware/optionalAuth');

router.route('/')
  .get(optionalProtect, getProperties)
  .post(protect, createProperty);

router.route('/:id')
  .get(getPropertyById);

router.route('/:id/status')
  .put(protect, updatePropertyStatus);

module.exports = router;
