const Booking = require('../models/Booking');
const Property = require('../models/Property');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
  try {
    const { propertyId, checkInDate } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const checkIn = new Date(checkInDate);

    // Total price is simply the monthly rent for PGs
    const totalPrice = property.price;

    const booking = new Booking({
      userId: req.user._id,
      propertyId,
      checkInDate: checkIn,
      totalPrice
    });

    const createdBooking = await booking.save();
    res.status(201).json(createdBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user bookings
// @route   GET /api/bookings/mybookings
// @access  Private
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id }).populate('propertyId');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all bookings (admin)
// @route   GET /api/bookings
// @access  Private/Admin
const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({}).populate('userId', 'id name').populate('propertyId', 'title');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get bookings for owner properties
// @route   GET /api/bookings/owner
// @access  Private/Owner
const getOwnerBookings = async (req, res) => {
  try {
    // Find all properties owned by this user
    const ownerProperties = await Property.find({ ownerId: req.user._id });
    const propertyIds = ownerProperties.map(p => p._id);

    // Find all bookings for those properties
    const bookings = await Booking.find({ propertyId: { $in: propertyIds } })
      .populate('userId', 'name email')
      .populate('propertyId', 'title location price');

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private/Owner
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id).populate('propertyId');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify ownership
    if (booking.propertyId.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    booking.status = status;
    if (status === 'confirmed') {
      booking.paymentStatus = 'paid'; // Or stay pending until actual payment
    }

    await booking.save();
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookings,
  getOwnerBookings,
  updateBookingStatus
};
