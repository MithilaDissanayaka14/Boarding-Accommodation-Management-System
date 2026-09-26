const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AppError = require('../utils/AppError');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');
const logger = require('../utils/logger');

// Local uploads directory path
const uploadDir = path.join(__dirname, '../../uploads');

// Ensure local directory exists recursively
const ensureUploadDirExists = () => {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    logger.info(`Initialized local uploads directory at ${uploadDir}`);
  }
};

ensureUploadDirExists();

// Local Disk Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    ensureUploadDirExists();
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// File filter for property photos (images only)
const imageFileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        'Invalid image format. Only JPEG, PNG, and WebP files are allowed (max 5MB).',
        400
      ),
      false
    );
  }
};

// File filter for payment slips (images + PDF)
const slipFileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        'Invalid slip format. Only JPEG, PNG, WebP, or PDF files are allowed (max 5MB).',
        400
      ),
      false
    );
  }
};

const uploadImages = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: imageFileFilter,
});

const uploadSlip = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: slipFileFilter,
});

/**
 * Helper to process uploaded file:
 * If Cloudinary is configured, upload to Cloudinary and delete local temp file.
 * If not, return relative local static URL (e.g. /uploads/filename.jpg).
 */
const processUploadedFile = async (file, folder = 'bams_media') => {
  if (!file) return null;

  if (isCloudinaryConfigured) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: `bams/${folder}`,
        resource_type: file.mimetype === 'application/pdf' ? 'raw' : 'image',
      });
      // Remove local copy after cloud upload
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      return result.secure_url;
    } catch (err) {
      logger.error('Cloudinary upload error, falling back to local file URL:', err);
      return `/uploads/${path.basename(file.path)}`;
    }
  }

  // Local static file URL
  return `/uploads/${path.basename(file.path)}`;
};

module.exports = {
  uploadImages,
  uploadSlip,
  processUploadedFile,
  uploadDir,
};
