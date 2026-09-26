const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { createReviewSchema } = require('../validations/reviewValidation');
const { ROLES } = require('../constants/roles');

router.get('/listing/:listingId', reviewController.getListingReviews);

router.post(
  '/',
  protect,
  restrictTo(ROLES.STUDENT),
  validate({ body: createReviewSchema }),
  reviewController.createReview
);

router.get(
  '/my',
  protect,
  restrictTo(ROLES.STUDENT),
  reviewController.getMyReviews
);

module.exports = router;
