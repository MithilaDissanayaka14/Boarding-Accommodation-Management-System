require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const dns = require('node:dns');

// Configure reliable DNS servers to avoid querySrv ECONNREFUSED on Windows
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // Ignore if not permitted
}

const mongoose = require('mongoose');
const User = require('../src/models/User');
const Listing = require('../src/models/Listing');
const Booking = require('../src/models/Booking');
const Invoice = require('../src/models/Invoice');
const MaintenanceRequest = require('../src/models/MaintenanceRequest');
const Review = require('../src/models/Review');
const logger = require('../src/utils/logger');
const { BOOKING_STATUS, INVOICE_STATUS, MAINTENANCE_STATUS, MAINTENANCE_PRIORITY } = require('../src/constants/statuses');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/boarding_db';
    logger.info(`Connecting to MongoDB for seeding: ${mongoUri}`);
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 15000 });

    logger.info('Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Listing.deleteMany({}),
      Booking.deleteMany({}),
      Invoice.deleteMany({}),
      MaintenanceRequest.deleteMany({}),
      Review.deleteMany({}),
    ]);

    logger.info('Creating demo users...');
    // Landlord 1: Nimal Jayasinghe (Malabe)
    const landlord1 = await User.create({
      name: 'Nimal Jayasinghe',
      email: 'nimal@landlord.lk',
      password: 'password123',
      role: 'landlord',
      phone: '+94 77 123 4567',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
      isVerified: true,
    });

    // Landlord 2: Sunil Fernando (Moratuwa)
    const landlord2 = await User.create({
      name: 'Sunil Fernando',
      email: 'sunil@landlord.lk',
      password: 'password123',
      role: 'landlord',
      phone: '+94 71 987 6543',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
      isVerified: true,
    });

    // Student 1: Kamal Perera (SLIIT Student)
    const student1 = await User.create({
      name: 'Kamal Perera',
      email: 'kamal@sliit.lk',
      password: 'password123',
      role: 'student',
      phone: '+94 78 555 1234',
      university: 'SLIIT',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80',
      isVerified: true,
    });

    // Student 2: Chamari Silva (NSBM Student)
    const student2 = await User.create({
      name: 'Chamari Silva',
      email: 'chamari@nsbm.lk',
      password: 'password123',
      role: 'student',
      phone: '+94 76 444 8888',
      university: 'NSBM',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
      isVerified: true,
    });

    // Admin: Platform Admin
    await User.create({
      name: 'BAMS Admin',
      email: 'admin@bams.lk',
      password: 'adminpassword123',
      role: 'admin',
      phone: '+94 11 200 3000',
      isVerified: true,
    });

    logger.info('Creating realistic property listings...');
    const listings = await Listing.create([
      {
        ownerId: landlord1._id,
        title: 'Green Villa Modern Student Annex (Near SLIIT Main Gate)',
        description: 'Spacious and newly furnished student rooms located just 500 meters from SLIIT campus. Features high-speed fiber Wi-Fi, study tables, personal wardrobes, and a peaceful study atmosphere. 24/7 CCTV security and quiet suburban neighborhood.',
        address: 'No. 45, Kaduwela Road, Malabe',
        city: 'Malabe',
        nearestUniversity: 'SLIIT',
        distanceToCampus: '500m (5 mins walk)',
        rentAmount: 16000,
        keyMoney: 32000,
        roomType: 'shared',
        totalBeds: 2,
        availableBeds: 1, // 1 bed taken by Kamal's accepted booking
        genderPreference: 'boys_only',
        facilities: ['Wi-Fi', 'Attached Bathroom', 'Study Desk', 'Hot Water', 'Parking', 'Kitchen Sharing'],
        houseRules: ['No smoking inside', 'Quiet hours after 10:30 PM', 'Visitors allowed until 7 PM'],
        utilitiesIncluded: true,
        images: [
          'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80',
        ],
        isAvailable: true,
        averageRating: 4.8,
        totalReviews: 2,
      },
      {
        ownerId: landlord1._id,
        title: 'Sunflower Deluxe Single Room with Attached Bath',
        description: 'Private single room with an attached modern bathroom and private balcony. Ideal for female undergraduates seeking a quiet, clean, and secure living space. Includes shared kitchen with refrigerator and microwave.',
        address: 'No. 12, Pothuarawa Road, Malabe',
        city: 'Malabe',
        nearestUniversity: 'SLIIT',
        distanceToCampus: '900m (8 mins walk)',
        rentAmount: 22000,
        keyMoney: 44000,
        roomType: 'single',
        totalBeds: 1,
        availableBeds: 1,
        genderPreference: 'girls_only',
        facilities: ['Wi-Fi', 'Attached Bathroom', 'Study Desk', 'Kitchen Sharing', 'Balcony'],
        houseRules: ['Girls only', 'No loud music', 'Gate closes at 10 PM'],
        utilitiesIncluded: false,
        images: [
          'https://images.unsplash.com/photo-1540518614846-7ede433c4ef5?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&auto=format&fit=crop&q=80',
        ],
        isAvailable: true,
        averageRating: 4.9,
        totalReviews: 1,
      },
      {
        ownerId: landlord1._id,
        title: 'CampusEdge 4-Bed Shared Dorm near NSBM Green University',
        description: 'Affordable and social boarding house for NSBM students. Located along the main bus route to Pitipana campus. Equipped with high-speed fiber internet, large individual lockers, separate study zones, and solar hot water.',
        address: 'Pitipana North, Homagama',
        city: 'Homagama',
        nearestUniversity: 'NSBM',
        distanceToCampus: '1.2 km (Direct bus / 12 mins walk)',
        rentAmount: 11500,
        keyMoney: 15000,
        roomType: 'shared',
        totalBeds: 4,
        availableBeds: 4,
        genderPreference: 'any',
        facilities: ['Wi-Fi', 'Common Bathroom', 'Study Desk', 'Solar Hot Water', 'Water Purifier'],
        houseRules: ['Keep common areas clean', 'Study atmosphere strictly observed'],
        utilitiesIncluded: true,
        images: [
          'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&auto=format&fit=crop&q=80',
        ],
        isAvailable: true,
        averageRating: 4.5,
        totalReviews: 3,
      },
      {
        ownerId: landlord2._id,
        title: 'TechZone Annex for Moratuwa Engineering Undergrads',
        description: 'Quiet annex specifically set up for Moratuwa University engineering students. Located in Katubedda with no curfew hassle for late-night campus lab sessions. High-speed Wi-Fi and power-backup inverter for uninterrupted studying.',
        address: 'No. 88, Molpe Road, Katubedda, Moratuwa',
        city: 'Moratuwa',
        nearestUniversity: 'UoM',
        distanceToCampus: '600m (6 mins walk to Katubedda gate)',
        rentAmount: 14000,
        keyMoney: 28000,
        roomType: 'shared',
        totalBeds: 2,
        availableBeds: 2,
        genderPreference: 'boys_only',
        facilities: ['Wi-Fi', 'Attached Bathroom', 'Power Backup', 'Study Desk', 'Parking'],
        houseRules: ['Engineering students preferred', 'No unauthorized guests overnight'],
        utilitiesIncluded: false,
        images: [
          'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1502005229762-ee1b2da97a0f?w=800&auto=format&fit=crop&q=80',
        ],
        isAvailable: true,
        averageRating: 4.7,
        totalReviews: 4,
      },
      {
        ownerId: landlord2._id,
        title: 'Kelaniya University Haven - Quiet Shared Boarding',
        description: 'Comfortable and affordable accommodation for University of Kelaniya undergraduates. Just two bus stops away from Dalugama campus. Includes spacious wardrobes, study hall access, and filtered drinking water.',
        address: 'Dalugama, Kelaniya',
        city: 'Kelaniya',
        nearestUniversity: 'UoK',
        distanceToCampus: '700m (7 mins walk)',
        rentAmount: 10000,
        keyMoney: 20000,
        roomType: 'shared',
        totalBeds: 3,
        availableBeds: 3,
        genderPreference: 'girls_only',
        facilities: ['Wi-Fi', 'Common Bathroom', 'Study Desk', 'Kitchen Access'],
        houseRules: ['Girls only', 'Curfew at 9:30 PM'],
        utilitiesIncluded: true,
        images: [
          'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&auto=format&fit=crop&q=80',
        ],
        isAvailable: true,
        averageRating: 4.6,
        totalReviews: 2,
      },
    ]);

    logger.info('Creating demo booking requests...');
    // Booking 1: Kamal accepted at Green Villa (Scenario 1 & 2)
    const booking1 = await Booking.create({
      studentId: student1._id,
      listingId: listings[0]._id,
      ownerId: landlord1._id,
      moveInDate: new Date('2026-10-01'),
      message: 'Hi Mr. Nimal, I am a 2nd year IT undergraduate at SLIIT. Looking forward to moving in soon!',
      status: BOOKING_STATUS.ACCEPTED,
    });

    // Booking 2: Chamari pending at Sunflower Deluxe
    await Booking.create({
      studentId: student2._id,
      listingId: listings[1]._id,
      ownerId: landlord1._id,
      moveInDate: new Date('2026-11-01'),
      message: 'Hello, I am interested in this room for the upcoming academic semester.',
      status: BOOKING_STATUS.PENDING,
    });

    logger.info('Creating demo rent invoices and slip records (Scenario 3)...');
    // Invoice 1: October 2026 rent for Kamal (Verified)
    await Invoice.create({
      bookingId: booking1._id,
      listingId: listings[0]._id,
      studentId: student1._id,
      ownerId: landlord1._id,
      billingMonth: 'October 2026',
      amount: 16000,
      dueDate: new Date('2026-10-05'),
      paymentSlipUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80',
      transactionRef: 'BOC-TXN-88912903',
      status: INVOICE_STATUS.VERIFIED,
      submittedAt: new Date('2026-10-03'),
      verifiedAt: new Date('2026-10-04'),
    });

    // Invoice 2: November 2026 rent for Kamal (Unpaid / Current due)
    await Invoice.create({
      bookingId: booking1._id,
      listingId: listings[0]._id,
      studentId: student1._id,
      ownerId: landlord1._id,
      billingMonth: 'November 2026',
      amount: 16000,
      dueDate: new Date('2026-11-05'),
      status: INVOICE_STATUS.UNPAID,
    });

    logger.info('Creating demo maintenance ticket (Scenario 3)...');
    await MaintenanceRequest.create({
      listingId: listings[0]._id,
      tenantId: student1._id,
      ownerId: landlord1._id,
      title: 'Bathroom Tap Leaking',
      description: 'Water is steadily dripping under the bathroom sink since yesterday evening.',
      priority: MAINTENANCE_PRIORITY.MEDIUM,
      status: MAINTENANCE_STATUS.IN_PROGRESS,
      landlordNote: 'Noted Kamal. Have contacted the plumber Mr. Sarath, he will visit tomorrow at 10 AM.',
    });

    logger.info('Creating demo review (Scenario 4)...');
    await Review.create({
      listingId: listings[0]._id,
      studentId: student1._id,
      rating: 5,
      cleanliness: 5,
      landlordCommunication: 5,
      safety: 5,
      comment: 'Excellent boarding place! Very close to SLIIT, fast Wi-Fi for studying, and Mr. Nimal is a very supportive and understanding landlord. Highly recommended for students!',
    });

    logger.info('==================================================');
    logger.info('✅ Database seeded successfully with realistic data!');
    logger.info('Demo Credentials:');
    logger.info('   Student:  kamal@sliit.lk / password123');
    logger.info('   Student:  chamari@nsbm.lk / password123');
    logger.info('   Landlord: nimal@landlord.lk / password123');
    logger.info('   Landlord: sunil@landlord.lk / password123');
    logger.info('   Admin:    admin@bams.lk / adminpassword123');
    logger.info('==================================================');

    process.exit(0);
  } catch (error) {
    logger.error('Failed to seed database:', error);
    process.exit(1);
  }
};

seedData();
