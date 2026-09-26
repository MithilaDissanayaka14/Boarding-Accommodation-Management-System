const express = require('express');
const router = express.Router();
const listingController = require('../controllers/listingController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');
const { uploadImages } = require('../middlewares/uploadMiddleware');
const { ROLES } = require('../constants/roles');

router.get('/', listingController.getAllListings);
router.get(
  '/my/properties',
  protect,
  restrictTo(ROLES.LANDLORD, ROLES.ADMIN),
  listingController.getMyListings
);
router.get('/:id', listingController.getListingById);

router.post(
  '/',
  protect,
  restrictTo(ROLES.LANDLORD, ROLES.ADMIN),
  uploadImages.array('images', 6),
  listingController.createListing
);

router.patch(
  '/:id',
  protect,
  restrictTo(ROLES.LANDLORD, ROLES.ADMIN),
  uploadImages.array('images', 6),
  listingController.updateListing
);

router.delete(
  '/:id',
  protect,
  restrictTo(ROLES.LANDLORD, ROLES.ADMIN),
  listingController.deleteListing
);

module.exports = router;
