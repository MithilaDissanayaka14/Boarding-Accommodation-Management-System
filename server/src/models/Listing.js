const mongoose = require('mongoose');
const { ROOM_TYPE, GENDER_PREFERENCE } = require('../constants/statuses');

const listingSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A listing must belong to a landlord/property owner'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a descriptive title for your accommodation'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide an accommodation description'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Please provide a street address'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'Please provide the city/suburb (e.g., Malabe, Homagama)'],
      trim: true,
      index: true,
    },
    nearestUniversity: {
      type: String,
      required: [true, 'Please specify the nearest university campus'],
      trim: true,
      index: true,
    },
    distanceToCampus: {
      type: String,
      default: 'Within 1 km',
      trim: true,
    },
    rentAmount: {
      type: Number,
      required: [true, 'Please specify the monthly rent amount in LKR'],
      min: [0, 'Rent amount cannot be negative'],
      index: true,
    },
    keyMoney: {
      type: Number,
      default: 0,
      min: [0, 'Key money cannot be negative'],
    },
    roomType: {
      type: String,
      enum: {
        values: [ROOM_TYPE.SINGLE, ROOM_TYPE.SHARED, ROOM_TYPE.ANNEX, ROOM_TYPE.APARTMENT],
        message: '{VALUE} is not a valid room type',
      },
      default: ROOM_TYPE.SINGLE,
    },
    totalBeds: {
      type: Number,
      required: [true, 'Please specify total bed capacity'],
      min: [1, 'Total beds must be at least 1'],
      default: 1,
    },
    availableBeds: {
      type: Number,
      required: [true, 'Please specify currently available beds'],
      min: [0, 'Available beds cannot be negative'],
      default: 1,
    },
    genderPreference: {
      type: String,
      enum: {
        values: [
          GENDER_PREFERENCE.BOYS_ONLY,
          GENDER_PREFERENCE.GIRLS_ONLY,
          GENDER_PREFERENCE.ANY,
        ],
        message: '{VALUE} is not a valid gender preference',
      },
      default: GENDER_PREFERENCE.ANY,
    },
    facilities: {
      type: [String],
      default: ['Wi-Fi'],
    },
    houseRules: {
      type: [String],
      default: [],
    },
    utilitiesIncluded: {
      type: Boolean,
      default: false,
    },
    images: {
      type: [String],
      default: [],
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: [0, 'Rating must be at least 0'],
      max: [5, 'Rating cannot exceed 5'],
      set: (val) => Math.round(val * 10) / 10, // Round to 1 decimal place
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound Indexes for fast, filtered querying
listingSchema.index({ city: 1, rentAmount: 1, isAvailable: 1 });
listingSchema.index({ nearestUniversity: 1, isAvailable: 1 });
listingSchema.index({ roomType: 1, genderPreference: 1, isAvailable: 1 });

// Full-Text Search Index
listingSchema.index(
  {
    title: 'text',
    description: 'text',
    address: 'text',
    city: 'text',
  },
  {
    weights: {
      title: 5,
      city: 4,
      description: 2,
      address: 1,
    },
    name: 'listing_text_search_index',
  }
);

// Pre-save synchronization hook: ensure isAvailable matches availableBeds
listingSchema.pre('save', function (next) {
  if (this.availableBeds === 0) {
    this.isAvailable = false;
  } else if (this.availableBeds > 0 && !this.isModified('isAvailable')) {
    this.isAvailable = true;
  }
  next();
});

const Listing = mongoose.model('Listing', listingSchema);

module.exports = Listing;
