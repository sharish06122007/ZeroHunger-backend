// seed.js - Database Seeder for ZeroHunger
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Food = require('./models/Food');
const Request = require('./models/Request');
const Notification = require('./models/Notification');
const logger = require('./config/logger');

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/zerohunger';

const seedData = async () => {
  try {
    logger.info('Connecting to MongoDB for seeding...');
    await mongoose.connect(mongoUri);
    logger.info('Connected to MongoDB.');

    // Clear existing collections
    await User.deleteMany({});
    await Food.deleteMany({});
    await Request.deleteMany({});
    await Notification.deleteMany({});
    logger.info('Cleared existing database collections.');

    // 1. Create Seed Users
    const users = await User.create([
      {
        fullName: 'Admin Control Center',
        email: 'admin@zerohunger.org',
        password: 'Password123!',
        role: 'admin',
        phone: '+91 9999999999',
        isVerified: true,
        profileCompleted: true,
        city: 'Mumbai',
        organizationName: 'ZeroHunger HQ',
      },
      {
        fullName: 'Chef Ramesh Kumar',
        email: 'tajhotel@zerohunger.org',
        password: 'Password123!',
        role: 'restaurant',
        phone: '+91 9820012345',
        isVerified: true,
        profileCompleted: true,
        city: 'Mumbai',
        address: 'Taj Palace Hotel, Colaba, Mumbai - 400001',
        organizationName: 'The Taj Palace Hotel',
      },
      {
        fullName: 'Bakers Delight Bakery',
        email: 'bakers@zerohunger.org',
        password: 'Password123!',
        role: 'restaurant',
        phone: '+91 9820098765',
        isVerified: true,
        profileCompleted: true,
        city: 'Mumbai',
        address: 'Hill Road, Bandra West, Mumbai - 400050',
        organizationName: 'Bakers Delight',
      },
      {
        fullName: 'Asha Foundation NGO',
        email: 'asha.ngo@zerohunger.org',
        password: 'Password123!',
        role: 'ngo',
        phone: '+91 9811122233',
        isVerified: true,
        profileCompleted: true,
        city: 'Mumbai',
        address: 'Dadar Community Shelter, Mumbai',
        organizationName: 'Asha Welfare Foundation',
      },
      {
        fullName: 'Rahul Sharma',
        email: 'volunteer@zerohunger.org',
        password: 'Password123!',
        role: 'volunteer',
        phone: '+91 9765432109',
        isVerified: true,
        profileCompleted: true,
        city: 'Mumbai',
      },
      {
        fullName: 'Anita Desai',
        email: 'donor@zerohunger.org',
        password: 'Password123!',
        role: 'donor',
        phone: '+91 9888877766',
        isVerified: true,
        profileCompleted: true,
        city: 'Mumbai',
      },
    ]);

    logger.info(`Created ${users.length} seed users.`);

    const restaurantUser = users[1];
    const bakeryUser = users[2];
    const ngoUser = users[3];
    const volunteerUser = users[4];

    // 2. Create Food Listings
    const foods = await Food.create([
      {
        title: '50 Fresh Cooked Vegetarian Buffet Meals',
        description: 'Surplus buffet meals stored in temperature-controlled units. Includes Basmati Rice, Paneer Butter Masala, Dal Tadka, Rotis, and Gulab Jamun.',
        category: 'cooked',
        quantity: '50 boxes',
        quantityUnit: 'servings',
        status: 'available',
        expiryTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        pickupTime: new Date(Date.now() + 4 * 60 * 60 * 1000),
        pickupAddress: restaurantUser.address,
        city: 'Mumbai',
        donatedBy: restaurantUser._id,
        restaurantName: 'The Taj Palace Hotel',
        tags: ['vegetarian', 'fresh', 'buffet'],
      },
      {
        title: 'Assorted Bakery Bread & Croissants',
        description: 'Freshly baked artisan sourdough loaves, French baguettes, and butter croissants surplus from today\'s batch.',
        category: 'bakery',
        quantity: '30 packs',
        quantityUnit: 'packs',
        status: 'available',
        expiryTime: new Date(Date.now() + 36 * 60 * 60 * 1000),
        pickupTime: new Date(Date.now() + 6 * 60 * 60 * 1000),
        pickupAddress: bakeryUser.address,
        city: 'Mumbai',
        donatedBy: bakeryUser._id,
        restaurantName: 'Bakers Delight',
        tags: ['bakery', 'bread', 'pastries'],
      },
      {
        title: '40 kg Fresh Organic Produce (Tomatoes & Spinach)',
        description: 'Grade A fresh farm produce surplus. Ideal for NGO soup kitchens and community meal preparation.',
        category: 'raw',
        quantity: '40 kg',
        quantityUnit: 'kg',
        status: 'available',
        expiryTime: new Date(Date.now() + 72 * 60 * 60 * 1000),
        pickupAddress: 'APMC Market, Vashi, Navi Mumbai',
        city: 'Mumbai',
        donatedBy: restaurantUser._id,
        tags: ['raw', 'vegetables', 'organic'],
      },
      {
        title: 'Packaged Fruit Juice & Milk Cartons',
        description: '100 sealed Tetra Pak cartons of orange juice and fresh Toned Milk with 1-month shelf life remaining.',
        category: 'beverage',
        quantity: '100 cartons',
        quantityUnit: 'items',
        status: 'reserved',
        expiryTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        pickupAddress: restaurantUser.address,
        city: 'Mumbai',
        donatedBy: restaurantUser._id,
        reservedBy: ngoUser._id,
        tags: ['packaged', 'beverage', 'sealed'],
      },
    ]);

    logger.info(`Created ${foods.length} seed food listings.`);

    // 3. Create Requests
    const requests = await Request.create([
      {
        food: foods[0]._id,
        requestedBy: ngoUser._id,
        assignedVolunteer: volunteerUser._id,
        status: 'accepted',
        notes: 'Volunteer Rahul will arrive with insulated containers at 5 PM.',
        pickupAddress: restaurantUser.address,
        deliveryAddress: ngoUser.address,
      },
      {
        food: foods[1]._id,
        requestedBy: ngoUser._id,
        status: 'pending',
        notes: 'For evening distribution at Dadar shelter.',
        pickupAddress: bakeryUser.address,
        deliveryAddress: ngoUser.address,
      },
    ]);

    logger.info(`Created ${requests.length} seed requests.`);

    // 4. Create Notifications
    await Notification.create([
      {
        recipient: ngoUser._id,
        title: 'Request Accepted!',
        message: 'Your request for 30 boxes of Cooked Meals has been accepted by Taj Palace Hotel.',
        type: 'request_update',
        link: '/dashboard/requests',
      },
      {
        recipient: volunteerUser._id,
        title: 'New Rescue Task Nearby',
        message: 'A pickup task for 30 boxes of Cooked Meals is ready at Taj Palace Hotel.',
        type: 'food_available',
        link: '/dashboard/volunteer',
      },
    ]);

    logger.info('Created seed notifications.');

    console.log('\n==================================================');
    console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
    console.log('--------------------------------------------------');
    console.log('🔑 TEST ACCOUNTS (Password for all: Password123!):');
    console.log('   • Admin:      admin@zerohunger.org');
    console.log('   • Restaurant: tajhotel@zerohunger.org');
    console.log('   • Bakery:     bakers@zerohunger.org');
    console.log('   • NGO:        asha.ngo@zerohunger.org');
    console.log('   • Volunteer:  volunteer@zerohunger.org');
    console.log('   • Donor:      donor@zerohunger.org');
    console.log('--------------------------------------------------');
    console.log('🔑 UNIVERSAL TEST OTP FOR VERIFICATION / RESET: 123456');
    console.log('==================================================\n');

    process.exit(0);
  } catch (error) {
    logger.error('Error during seeding:', error);
    process.exit(1);
  }
};

seedData();
