// Cloudinary configuration for image uploads
// Used for tournament posters and other media

const { v2: cloudinary } = require('cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload image to Cloudinary
 * @param {string} filePath - Local file path
 * @param {string} folder - Cloudinary folder path
 * @param {object} options - Additional upload options
 * @returns {Promise} Upload result with secure_url and public_id
 */
const uploadImage = async (filePath, folder = 'courtify', options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      transformation: [
        { width: 1080, height: 1920, crop: 'limit' },  // Mobile-optimized
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ],
      ...options
    });

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      size: result.bytes
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Public ID of the image
 * @returns {Promise} Deletion result
 */
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return {
      success: result.result === 'ok',
      result
    };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get optimized image URL with transformations
 * @param {string} publicId - Public ID of the image
 * @param {object} transformations - Custom transformations
 * @returns {string} Optimized image URL
 */
const getOptimizedUrl = (publicId, transformations = {}) => {
  return cloudinary.url(publicId, {
    transformation: [
      { quality: 'auto' },
      { fetch_format: 'auto' },
      ...Object.entries(transformations).map(([key, value]) => ({ [key]: value }))
    ]
  });
};

module.exports = {
  cloudinary,
  uploadImage,
  deleteImage,
  getOptimizedUrl
};
