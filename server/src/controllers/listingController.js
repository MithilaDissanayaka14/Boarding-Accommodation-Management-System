const Listing = require('../models/Listing');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { processUploadedFile } = require('../middlewares/uploadMiddleware');

/**
 * Get all listings with multi-criteria dynamic filtering, text search, and pagination
 * GET /api/v1/listings
 */
const getAllListings = asyncHandler(async (req, res) => {
  const {
    city,
    university,
    minRent,
    maxRent,
    roomType,
    genderPreference,
    facilities,
    search,
    availableOnly,
    sort,
    page = 1,
    limit = 9,
  } = req.query;

  // Build filter query object
  const query = {};

  // Availability filter (default true for public discovery)
  if (availableOnly !== 'false') {
    query.isAvailable = true;
    query.availableBeds = { $gt: 0 };
  }

  // Location / City filter
  if (city && city.trim() !== '') {
    query.city = { $regex: new RegExp(city.trim(), 'i') };
  }

  // Nearest University filter
  if (university && university.trim() !== '' && university !== 'all') {
    query.nearestUniversity = { $regex: new RegExp(university.trim(), 'i') };
  }

  // Price range filters (LKR)
  if (minRent || maxRent) {
    query.rentAmount = {};
    if (minRent) query.rentAmount.$gte = Number(minRent);
    if (maxRent) query.rentAmount.$lte = Number(maxRent);
  }

  // Room type filter
  if (roomType && roomType !== 'all') {
    query.roomType = roomType;
  }

  // Gender preference filter
  if (genderPreference && genderPreference !== 'all') {
    query.genderPreference = { $in: [genderPreference, 'any'] };
  }

  // Facilities filter (must contain all selected amenities)
  if (facilities) {
    const facilitiesList = Array.isArray(facilities)
      ? facilities
      : facilities.split(',').map((f) => f.trim());
    if (facilitiesList.length > 0) {
      query.facilities = { $all: facilitiesList };
    }
  }

  // Keyword text search (uses compound text index or regex fallback)
  if (search && search.trim() !== '') {
    query.$text = { $search: search.trim() };
  }

  // Sorting
  let sortCriteria = { createdAt: -1 }; // default newest
  if (sort === 'price-asc') sortCriteria = { rentAmount: 1 };
  if (sort === 'price-desc') sortCriteria = { rentAmount: -1 };
  if (sort === 'rating-desc') sortCriteria = { averageRating: -1, totalReviews: -1 };

  // Pagination calculation
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  // Execute lean query for maximum performance
  const [listings, totalCount] = await Promise.all([
    Listing.find(query)
      .populate('ownerId', 'name email phone avatar isVerified')
      .sort(sortCriteria)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Listing.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalCount / limitNum);

  res.status(200).json({
    status: 'success',
    results: listings.length,
    pagination: {
      page: pageNum,
      limit: limitNum,
      totalPages,
      totalCount,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
    },
    data: {
      listings,
    },
  });
});

/**
 * Get single listing by ID
 * GET /api/v1/listings/:id
 */
const getListingById = asyncHandler(async (req, res, next) => {
  const listing = await Listing.findById(req.params.id)
    .populate('ownerId', 'name email phone avatar isVerified createdAt')
    .lean();

  if (!listing) {
    return next(new AppError('No accommodation found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      listing,
    },
  });
});

/**
 * Create a new property listing (Landlords only)
 * POST /api/v1/listings
 */
const createListing = asyncHandler(async (req, res, next) => {
  // Parse facilities and houseRules if sent as JSON strings via multipart form-data
  let facilities = req.body.facilities;
  if (typeof facilities === 'string') {
    try {
      facilities = JSON.parse(facilities);
    } catch {
      facilities = facilities.split(',').map((f) => f.trim());
    }
  }

  let houseRules = req.body.houseRules;
  if (typeof houseRules === 'string') {
    try {
      houseRules = JSON.parse(houseRules);
    } catch {
      houseRules = houseRules.split(',').map((r) => r.trim());
    }
  }

  // Handle uploaded images if any
  let imageUrls = [];
  if (req.files && req.files.length > 0) {
    const uploadPromises = req.files.map((file) => processUploadedFile(file, 'properties'));
    imageUrls = await Promise.all(uploadPromises);
  } else if (req.body.images) {
    imageUrls = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
  }

  const totalBeds = Number(req.body.totalBeds) || 1;
  const availableBeds = req.body.availableBeds !== undefined ? Number(req.body.availableBeds) : totalBeds;

  // Create listing document with strictly server-assigned ownerId
  const newListing = await Listing.create({
    ...req.body,
    ownerId: req.user._id,
    facilities: facilities || [],
    houseRules: houseRules || [],
    images: imageUrls,
    totalBeds,
    availableBeds,
    isAvailable: availableBeds > 0,
  });

  res.status(201).json({
    status: 'success',
    message: 'Listing created successfully',
    data: {
      listing: newListing,
    },
  });
});

/**
 * Update an existing listing (Owner Landlord only)
 * PATCH /api/v1/listings/:id
 */
const updateListing = asyncHandler(async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    return next(new AppError('No listing found with that ID', 404));
  }

  // Ensure caller is the owner
  if (listing.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('You do not have permission to update this listing', 403));
  }

  // Handle new uploaded images if provided
  if (req.files && req.files.length > 0) {
    const uploadPromises = req.files.map((file) => processUploadedFile(file, 'properties'));
    const newImageUrls = await Promise.all(uploadPromises);
    req.body.images = [...(listing.images || []), ...newImageUrls];
  }

  // Parse facilities/houseRules if stringified
  if (typeof req.body.facilities === 'string') {
    try {
      req.body.facilities = JSON.parse(req.body.facilities);
    } catch {
      req.body.facilities = req.body.facilities.split(',').map((f) => f.trim());
    }
  }

  // Update bed availability synchronization
  if (req.body.availableBeds !== undefined) {
    const avail = Number(req.body.availableBeds);
    req.body.availableBeds = avail;
    req.body.isAvailable = avail > 0;
  }

  const updatedListing = await Listing.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    message: 'Listing updated successfully',
    data: {
      listing: updatedListing,
    },
  });
});

/**
 * Delete a listing (Owner Landlord only)
 * DELETE /api/v1/listings/:id
 */
const deleteListing = asyncHandler(async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    return next(new AppError('No listing found with that ID', 404));
  }

  if (listing.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('You do not have permission to delete this listing', 403));
  }

  await Listing.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: 'success',
    message: 'Listing deleted successfully',
  });
});

/**
 * Get listings owned by the logged-in landlord
 * GET /api/v1/listings/my/properties
 */
const getMyListings = asyncHandler(async (req, res) => {
  const listings = await Listing.find({ ownerId: req.user._id })
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json({
    status: 'success',
    results: listings.length,
    data: {
      listings,
    },
  });
});

module.exports = {
  getAllListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  getMyListings,
};
