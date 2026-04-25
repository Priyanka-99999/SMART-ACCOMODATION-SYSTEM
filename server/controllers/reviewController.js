const Review = require('../models/Review');
const Property = require('../models/Property');

const createReview = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { rating, comment } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    // Check if user already reviewed
    const alreadyReviewed = await Review.findOne({ userId: req.user._id, propertyId });
    if (alreadyReviewed) return res.status(400).json({ message: 'You already reviewed this property' });

    const review = await Review.create({
      userId: req.user._id,
      propertyId,
      rating: Number(rating),
      comment
    });

    // Update property average rating
    const allReviews = await Review.find({ propertyId });
    const numReviews = allReviews.length;
    const avgRating = allReviews.reduce((acc, item) => item.rating + acc, 0) / numReviews;

    property.numReviews = numReviews;
    property.averageRating = avgRating;
    await property.save();

    // Populate user info for frontend
    await review.populate('userId', 'name');

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPropertyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ propertyId: req.params.propertyId }).populate('userId', 'name').sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createReview, getPropertyReviews };
