const Booking = require('../models/Booking');
const Property = require('../models/Property');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
  try {
    const { propertyId, checkInDate, checkOutDate } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    // Prevent double booking logic
    const existingBookings = await Booking.find({
      propertyId,
      status: { $ne: 'cancelled' },
      $or: [
        { checkInDate: { $lte: checkOut }, checkOutDate: { $gte: checkIn } }
      ]
    });

    if (existingBookings.length > 0) {
      return res.status(400).json({ message: 'Property is already booked for these dates' });
    }

    // Calculate total price based on days
    const diffTime = Math.abs(checkOut - checkIn);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const totalPrice = (diffDays === 0 ? 1 : diffDays) * property.price;

    const booking = new Booking({
      userId: req.user._id,
      propertyId,
      checkInDate: checkIn,
      checkOutDate: checkOut,
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

module.exports = {
  createBooking,
  getMyBookings,
  getBookings
};
