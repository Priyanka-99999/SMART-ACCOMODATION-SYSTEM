const Inquiry = require('../models/Inquiry');
const Property = require('../models/Property');

const createInquiry = async (req, res) => {
  try {
    const { propertyId, message, contactPhone } = req.body;
    
    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    const inquiry = await Inquiry.create({
      propertyId,
      ownerId: property.ownerId,
      userId: req.user._id,
      message,
      contactPhone
    });

    res.status(201).json(inquiry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyInquiries = async (req, res) => {
  try {
    const query = req.user.role === 'owner' ? { ownerId: req.user._id } : { userId: req.user._id };
    
    const inquiries = await Inquiry.find(query)
      .populate('propertyId', 'title location')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json(inquiries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateInquiryStatus = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });

    if (inquiry.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    inquiry.status = req.body.status;
    await inquiry.save();

    res.json(inquiry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createInquiry, getMyInquiries, updateInquiryStatus };
