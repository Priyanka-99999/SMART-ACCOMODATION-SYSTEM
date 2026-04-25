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
        title: 'Luxury Oceanfront Villa',
        description: 'Experience true luxury in this stunning 3-bedroom villa overlooking the ocean. Perfect for a relaxing getaway with all premium amenities.',
        price: 15000,
        location: 'malibu',
        gender: 'any',
        distance: '2km from beach',
        amenities: ['wifi', 'ac', 'pool', 'parking'],
        images: ['https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=1200'],
        ownerId: ownerUser._id,
        status: 'approved'
      },
      {
        title: 'Cozy Downtown Studio',
        description: 'A modern, compact studio right in the heart of the city. Walking distance to all major attractions and tech parks.',
        price: 4500,
        location: 'downtown',
        gender: 'any',
        distance: '500m from metro station',
        amenities: ['wifi', 'ac', 'gym'],
        images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1200'],
        ownerId: ownerUser._id,
        status: 'approved'
      },
      {
        title: 'Student Budget PG',
        description: 'Affordable and quiet PG located right next to the university campus. Ideal for students with food included.',
        price: 2500,
        location: 'college',
        gender: 'boys',
        distance: '100m from college gate',
        amenities: ['wifi', 'food'],
        images: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=1200'],
        ownerId: ownerUser._id,
        status: 'approved'
      },
      {
        title: 'Girls Only Hostel',
        description: 'Safe and secure girls hostel with 24/7 security, CCTV, and homely food. Very close to top colleges.',
        price: 3500,
        location: 'college',
        gender: 'girls',
        distance: '200m from college',
        amenities: ['wifi', 'food', 'ac'],
        images: ['https://images.unsplash.com/photo-1556912173-3bb406ef7e77?auto=format&fit=crop&q=80&w=1200'],
        ownerId: ownerUser._id,
        status: 'approved'
      },
      {
        title: 'Spacious Family Apartment',
        description: 'A large 4-bedroom apartment with a beautiful balcony. Great for family stays or group trips with full kitchen access.',
        price: 12000,
        location: 'suburbs',
        gender: 'any',
        distance: '3km from city center',
        amenities: ['wifi', 'ac', 'parking', 'kitchen'],
        images: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=1200'],
        ownerId: ownerUser._id,
        status: 'approved'
      },
      {
        title: 'Tech Hub Penthouse',
        description: 'Premium penthouse located near the major tech park. Features smart home devices and ultra high-speed internet.',
        price: 20000,
        location: 'downtown',
        gender: 'any',
        distance: '1km from tech park',
        amenities: ['wifi', 'ac', 'gym', 'pool', 'parking'],
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
