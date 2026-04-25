const Property = require('../models/Property');

const getProperties = async (req, res) => {
  try {
    let query = { status: 'approved' }; // Default for public view

    // Admin can fetch all/pending
    if (req.query.status && req.user && req.user.role === 'admin') {
      query.status = req.query.status;
    } else if (req.query.ownerId) {
       query.ownerId = req.query.ownerId;
       delete query.status; // Owners see their own properties
    }

    if (req.query.location) query.location = new RegExp(req.query.location, 'i');
    if (req.query.maxPrice) query.price = { $lte: Number(req.query.maxPrice) };
    if (req.query.amenities) {
      const amenitiesArr = req.query.amenities.split(',').map(a => new RegExp(a.trim(), 'i'));
      query.amenities = { $all: amenitiesArr };
    }
    if (req.query.gender && req.query.gender !== 'any') {
      query.gender = req.query.gender;
    }
    
    // Sort logic
    let sortObj = { createdAt: -1 };
    if (req.query.sort === 'price_asc') sortObj = { price: 1 };
    if (req.query.sort === 'price_desc') sortObj = { price: -1 };

    const properties = await Property.find(query).sort(sortObj);
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('ownerId', 'name email');
    if (property) {
      res.json(property);
    } else {
      res.status(404).json({ message: 'Property not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createProperty = async (req, res) => {
  try {
    if (req.user.role !== 'owner' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only owners can list properties' });
    }

    const { title, description, price, location, amenities, images, gender, distance } = req.body;
    
    const property = new Property({
      title,
      description,
      price,
      location,
      amenities,
      images,
      gender,
      distance,
      ownerId: req.user._id,
      status: req.user.role === 'admin' ? 'approved' : 'pending' 
    });

    const createdProperty = await property.save();
    res.status(201).json(createdProperty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updatePropertyStatus = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized as admin' });
    }
    
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    property.status = req.body.status;
    await property.save();

    res.json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProperties, getPropertyById, createProperty, updatePropertyStatus };
