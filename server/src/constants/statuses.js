const BOOKING_STATUS = Object.freeze({
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
});

const INVOICE_STATUS = Object.freeze({
  UNPAID: 'unpaid',
  SUBMITTED: 'submitted',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
});

const MAINTENANCE_STATUS = Object.freeze({
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
});

const MAINTENANCE_PRIORITY = Object.freeze({
  LOW: 'low',
  MEDIUM: 'medium',
  URGENT: 'urgent',
});

const ROOM_TYPE = Object.freeze({
  SINGLE: 'single',
  SHARED: 'shared',
  ANNEX: 'annex',
  APARTMENT: 'apartment',
});

const GENDER_PREFERENCE = Object.freeze({
  BOYS_ONLY: 'boys_only',
  GIRLS_ONLY: 'girls_only',
  ANY: 'any',
});

module.exports = {
  BOOKING_STATUS,
  INVOICE_STATUS,
  MAINTENANCE_STATUS,
  MAINTENANCE_PRIORITY,
  ROOM_TYPE,
  GENDER_PREFERENCE,
};
