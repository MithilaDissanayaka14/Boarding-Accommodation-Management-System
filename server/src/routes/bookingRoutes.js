const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const {
  createBookingSchema,
  updateBookingStatusSchema,
} = require('../validations/bookingValidation');
const { ROLES } = require('../constants/roles');

router.post(
  '/',
  protect,
  restrictTo(ROLES.STUDENT),
  validate({ body: createBookingSchema }),
  bookingController.createBooking
);

router.get(
  '/my',
  protect,
  restrictTo(ROLES.STUDENT),
  bookingController.getMyStudentBookings
);

router.get(
  '/incoming',
  protect,
  restrictTo(ROLES.LANDLORD, ROLES.ADMIN),
  bookingController.getLandlordIncomingBookings
);

router.patch(
  '/:id/status',
  protect,
  restrictTo(ROLES.LANDLORD, ROLES.ADMIN),
  validate({ body: updateBookingStatusSchema }),
  bookingController.updateBookingStatus
);

router.patch('/:id/cancel', protect, bookingController.cancelBooking);

module.exports = router;
