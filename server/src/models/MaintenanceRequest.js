const mongoose = require('mongoose');
const { MAINTENANCE_STATUS, MAINTENANCE_PRIORITY } = require('../constants/statuses');

const maintenanceRequestSchema = new mongoose.Schema(
  {
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: [true, 'Maintenance request must be associated with a listing'],
      index: true,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Maintenance request must specify the reporting tenant'],
      index: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Maintenance request must be addressed to the landlord'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide an issue title (e.g., Tap Leaking)'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please describe the maintenance issue in detail'],
      trim: true,
    },
    priority: {
      type: String,
      enum: {
        values: [
          MAINTENANCE_PRIORITY.LOW,
          MAINTENANCE_PRIORITY.MEDIUM,
          MAINTENANCE_PRIORITY.URGENT,
        ],
        message: '{VALUE} is not a valid priority',
      },
      default: MAINTENANCE_PRIORITY.MEDIUM,
    },
    status: {
      type: String,
      enum: {
        values: [
          MAINTENANCE_STATUS.PENDING,
          MAINTENANCE_STATUS.IN_PROGRESS,
          MAINTENANCE_STATUS.RESOLVED,
        ],
        message: '{VALUE} is not a valid maintenance status',
      },
      default: MAINTENANCE_STATUS.PENDING,
      index: true,
    },
    landlordNote: {
      type: String,
      default: '',
      trim: true,
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
maintenanceRequestSchema.index({ tenantId: 1, status: 1 });
maintenanceRequestSchema.index({ ownerId: 1, status: 1 });
maintenanceRequestSchema.index({ listingId: 1, status: 1 });

const MaintenanceRequest = mongoose.model(
  'MaintenanceRequest',
  maintenanceRequestSchema
);

module.exports = MaintenanceRequest;
