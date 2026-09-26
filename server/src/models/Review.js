const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: [true, 'A review must be linked to a listing'],
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A review must be written by a student'],
      index: true,
    },
    rating: {
      type: Number,
      required: [true, 'Please provide an overall rating (1-5)'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    cleanliness: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    landlordCommunication: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    safety: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    comment: {
      type: String,
      required: [true, 'Please write your review feedback'],
      trim: true,
      maxlength: [1000, 'Review cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Prevent duplicate review by same student for the same listing
reviewSchema.index({ listingId: 1, studentId: 1 }, { unique: true });

// Static aggregation method to compute average ratings
reviewSchema.statics.calculateAverageRating = async function (listingId) {
  const stats = await this.aggregate([
    { $match: { listingId: new mongoose.Types.ObjectId(listingId) } },
    {
      $group: {
        _id: '$listingId',
        nRatings: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  const Listing = mongoose.model('Listing');
  if (stats.length > 0) {
    await Listing.findByIdAndUpdate(listingId, {
      totalReviews: stats[0].nRatings,
      averageRating: Math.round(stats[0].avgRating * 10) / 10,
    });
  } else {
    await Listing.findByIdAndUpdate(listingId, {
      totalReviews: 0,
      averageRating: 0,
    });
  }
};

// Recalculate stats post save
reviewSchema.post('save', async function () {
  await this.constructor.calculateAverageRating(this.listingId);
});

// Recalculate stats post findOneAndDelete
reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc && doc.listingId) {
    const ReviewModel = mongoose.model('Review');
    if (typeof ReviewModel.calculateAverageRating === 'function') {
      await ReviewModel.calculateAverageRating(doc.listingId);
    }
  }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
