const { v2: cloudinary } = require('cloudinary');
const logger = require('../utils/logger');

const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  logger.info('Cloudinary configured for cloud media storage.');
} else {
  logger.info('Cloudinary credentials not provided. Falling back to local disk storage (/uploads).');
}

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
};
