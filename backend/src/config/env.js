const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from backend root .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const requiredEnvVars = [
  'PORT',
  'MONGODB_URI',
  'JWT_SECRET',
  'CLIENT_URL'
];

const requiredProductionEnvVars = [
  'JWT_SECRET',
];

function validateEnv() {
  const isProduction = process.env.NODE_ENV === 'production';
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (isProduction && !mongoUri) {
    console.error('[CRITICAL CONFIG ERROR] Missing MONGODB_URI (or MONGO_URI). Database connection cannot proceed.');
    process.exit(1);
  }

  const missing = [];
  const checkList = isProduction ? requiredProductionEnvVars : requiredEnvVars;

  for (const varName of checkList) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    const errorMsg = `[CONFIG NOTICE] Environment variable(s) not set: ${missing.join(', ')}.`;
    console.warn(errorMsg);
  }
}

validateEnv();

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  MONGODB_URI: process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/genzstyle',
  JWT_SECRET: process.env.JWT_SECRET || 'genzstyle_dev_jwt_secret_key_minimum_32_characters_length_long_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  SERVER_URL: process.env.SERVER_URL || 'http://localhost:5000',
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASSWORD: process.env.SMTP_PASSWORD || '',
  EMAIL_FROM: process.env.EMAIL_FROM || '"GENZSTYLE" <no-reply@genzstyle.com>',
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || '',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || '',
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || '',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@genzstyle.com',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'Admin@GenzStyle2026!'
};
