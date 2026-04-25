const Property = require('../models/Property');

// @desc    Recommend properties using simple NLP
// @route   POST /api/ai/recommend
// @access  Public
const recommendProperties = async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ message: 'Query is required' });
    }

    const lowerQuery = query.toLowerCase();
    
    let dbQuery = { status: 'approved' };

    // 1. Extract Budget — matches "under 5000", "below 5000", "< 5000"
    const budgetMatch = lowerQuery.match(/(under|below|<)\s*(\d+)/);
    if (budgetMatch && budgetMatch[2]) {
      dbQuery.price = { $lte: Number(budgetMatch[2]) };
    }

    // 2. Extract Amenities
    const knownAmenities = ['wifi', 'ac', 'food', 'parking', 'pool', 'gym', 'kitchen'];
    const foundAmenities = knownAmenities.filter(a => lowerQuery.includes(a));
    if (foundAmenities.length > 0) {
      dbQuery.amenities = { $all: foundAmenities };
    }

    // 3. Extract Location — matches words after "near", "in", "at"
    const locationMatch = lowerQuery.match(/(near|in|at)\s+([a-zA-Z0-9]+)/);
    if (locationMatch && locationMatch[2]) {
      dbQuery.location = new RegExp(locationMatch[2], 'i');
    }

    // 4. Extract Gender preference
    if (lowerQuery.includes('boys') || lowerQuery.includes('male')) {
      dbQuery.gender = 'boys';
    } else if (lowerQuery.includes('girls') || lowerQuery.includes('female')) {
      dbQuery.gender = 'girls';
    }

    const properties = await Property.find(dbQuery).limit(10);

    res.json({
      success: true,
      parsedCriteria: {
        maxPrice: dbQuery.price ? dbQuery.price.$lte : 'Any',
        location: locationMatch ? locationMatch[2] : 'Any',
        amenities: foundAmenities.length > 0 ? foundAmenities : 'Any',
        gender: dbQuery.gender || 'any',
      },
      results: properties
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { recommendProperties };
