const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected for Seeding'))
  .catch(err => { console.error(err); process.exit(1); });

const Property = require('./models/Property');
const User = require('./models/User');
const Booking = require('./models/Booking');
const Review = require('./models/Review');
const Inquiry = require('./models/Inquiry');

const seedDB = async () => {
  try {
    // Clear existing data
    await Property.deleteMany({});
    await Booking.deleteMany({});
    await Review.deleteMany({});
    await Inquiry.deleteMany({});
    await User.deleteMany({ email: { $in: ['admin@staysmart.com', 'owner@staysmart.com'] } });
    console.log('Cleared existing seed data');

    const salt = await bcrypt.genSalt(10);

    // Create Super Admin
    const adminUser = await User.create({
      name: 'Super Admin',
      email: 'admin@staysmart.com',
      password: await bcrypt.hash('password123', salt),
      role: 'admin'
    });

    // Create Sample PG Owner
    const ownerUser = await User.create({
      name: 'Sample PG Owner',
      email: 'owner@staysmart.com',
      password: await bcrypt.hash('password123', salt),
      role: 'owner'
    });

    console.log('Seed users created');

    const seedProperties = [
      {
        title: 'Premium Boys PG - City Center',
        description: 'Modern PG for students and working professionals. Includes 3 meals, high-speed WiFi, and daily cleaning. Walking distance from major coaching centers.',
        price: 8500,
        location: 'Koramangala',
        gender: 'boys',
        distance: '500m from Nexus Mall',
        amenities: ['wifi', 'food', 'ac', 'parking'],
        images: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=1200'],
        ownerId: ownerUser._id,
        status: 'approved'
      },
      {
        title: 'Comfort Girls Hostel',
        description: 'Safe and secure girls hostel with biometric entry, 24/7 security, and hygienic food. Located in a prime educational hub.',
        price: 7000,
        location: 'Indiranagar',
        gender: 'girls',
        distance: '200m from Metro Station',
        amenities: ['wifi', 'food', 'security', 'ac'],
        images: ['https://images.unsplash.com/photo-1556912173-3bb406ef7e77?auto=format&fit=crop&q=80&w=1200'],
        ownerId: ownerUser._id,
        status: 'approved'
      },
      {
        title: 'Elite Student Residency (Boys)',
        description: 'Luxury student living with single and double sharing rooms. Dedicated study areas and gym access included.',
        price: 12000,
        location: 'Whitefield',
        gender: 'boys',
        distance: '1km from ITPL',
        amenities: ['wifi', 'food', 'gym', 'ac'],
        images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1200'],
        ownerId: ownerUser._id,
        status: 'approved'
      },
      {
        title: 'StaySecure Girls PG',
        description: 'Spacious rooms with individual wardrobes and study tables. Excellent connectivity and home-style cooking.',
        price: 9500,
        location: 'HSR Layout',
        gender: 'girls',
        distance: '300m from BDA Complex',
        amenities: ['wifi', 'food', 'kitchen', 'security'],
        images: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=1200'],
        ownerId: ownerUser._id,
        status: 'approved'
      },
      {
        title: 'Executive Boys PG',
        description: 'Professional environment for working men. Prime location near tech parks. High-speed fiber internet and power backup.',
        price: 10500,
        location: 'Electronic City',
        gender: 'boys',
        distance: '800m from Infosys Gate',
        amenities: ['wifi', 'ac', 'parking', 'food'],
        images: ['https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&q=80&w=1200'],
        ownerId: ownerUser._id,
        status: 'approved'
      }
    ];

    await Property.insertMany(seedProperties);
    console.log('✅ 6 approved properties added!');
    console.log('\n=== TEST ACCOUNTS ===');
    console.log('Super Admin → admin@staysmart.com / password123');
    console.log('PG Owner   → owner@staysmart.com / password123');
    console.log('Tenant     → Register a new account');
    console.log('===================\n');

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDB();
