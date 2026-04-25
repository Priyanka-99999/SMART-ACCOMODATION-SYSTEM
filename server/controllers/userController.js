const User = require('../models/User');

const toggleWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const propertyId = req.params.id;

    if (user.wishlist.includes(propertyId)) {
      user.wishlist = user.wishlist.filter(id => id.toString() !== propertyId);
    } else {
      user.wishlist.push(propertyId);
    }

    await user.save();
    res.json(user.wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    res.json(user.wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { toggleWishlist, getWishlist };
