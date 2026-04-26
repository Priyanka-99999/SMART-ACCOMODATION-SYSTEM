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
    let nlpCriteriaFound = false;

    // 1. Extract Budget
    const budgetMatch = lowerQuery.match(/(under|below|less than|<|budget of)\s*(\d+)/);
    if (budgetMatch && budgetMatch[2]) {
      dbQuery.price = { $lte: Number(budgetMatch[2]) };
      nlpCriteriaFound = true;
    }

    // 2. Extract Amenities
    const knownAmenities = ['wifi', 'ac', 'food', 'parking', 'pool', 'gym', 'kitchen', 'laundry', 'security'];
    const foundAmenities = knownAmenities.filter(a => lowerQuery.includes(a));
    if (foundAmenities.length > 0) {
      dbQuery.amenities = { $all: foundAmenities };
      nlpCriteriaFound = true;
    }

    // 3. Extract Location
    const locationMatch = lowerQuery.match(/(near|in|at|around)\s+([a-zA-Z0-9\s]+)/);
    // Be careful with common words as location
    if (locationMatch && locationMatch[2]) {
      const loc = locationMatch[2].split(' ')[0]; // Take first word to avoid greedy matching
      dbQuery.location = new RegExp(loc, 'i');
      nlpCriteriaFound = true;
    }

    // 4. Extract Gender
    if (lowerQuery.includes('boys') || lowerQuery.includes('male') || lowerQuery.includes('men')) {
      dbQuery.gender = { $in: ['boys', 'any', 'co-ed'] };
      nlpCriteriaFound = true;
    } else if (lowerQuery.includes('girls') || lowerQuery.includes('female') || lowerQuery.includes('women')) {
      dbQuery.gender = { $in: ['girls', 'any', 'co-ed'] };
      nlpCriteriaFound = true;
    }

    // Fallback: If no structured criteria found, or as a supplement, use text search
    let properties;
    if (!nlpCriteriaFound) {
      // Use Mongo Text Search
      properties = await Property.find({ 
        $text: { $search: query },
        status: 'approved'
      })
      .sort({ score: { $meta: 'textScore' } })
      .limit(10);
    } else {
      properties = await Property.find(dbQuery).limit(10);
    }

    // If still nothing, do a broad search on location
    if (properties.length === 0 && query.length > 2) {
      properties = await Property.find({
        status: 'approved',
        $or: [
          { location: new RegExp(query, 'i') },
          { title: new RegExp(query, 'i') }
        ]
      }).limit(5);
    }

    res.json({
      success: true,
      parsedCriteria: {
        maxPrice: dbQuery.price ? dbQuery.price.$lte : 'Any',
        location: locationMatch ? locationMatch[2] : 'Any',
        amenities: foundAmenities.length > 0 ? foundAmenities : 'Any',
        gender: dbQuery.gender ? (typeof dbQuery.gender === 'string' ? dbQuery.gender : 'Specific') : 'any',
      },
      results: properties
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { recommendProperties };
