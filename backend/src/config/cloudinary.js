const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const env = require('./env');

if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true
  });
} else {
  console.warn('[CLOUDINARY WARNING] Cloudinary credentials not fully supplied. Local upload fallback or direct image links enabled for testing.');
}

// Multer memory storage for direct upload streaming
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WEBP) are allowed.'), false);
    }
  }
});

const uploadToCloudinary = (fileBuffer, folder = 'genzstyle/products') => {
  return new Promise((resolve, reject) => {
    if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY) {
      // In development fallback if credentials not yet configured by user
      const base64Image = `data:image/jpeg;base64,${fileBuffer.toString('base64')}`;
      return resolve({
        secure_url: base64Image,
        public_id: `dev_${Date.now()}`
      });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        transformation: [
          { quality: 'auto', fetch_format: 'auto' },
          { width: 1200, crop: 'limit' }
        ]
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    uploadStream.end(fileBuffer);
  });
};

module.exports = {
  cloudinary,
  upload,
  uploadToCloudinary
};
