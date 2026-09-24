const mongoose = require('mongoose');
const env = require('./env');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }

  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      autoIndex: true, // Build indexes automatically
      serverSelectionTimeoutMS: 8000,
    });

    isConnected = true;
    console.log(`[DATABASE] MongoDB Connected successfully: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.error(`[DATABASE ERROR] MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[DATABASE WARNING] MongoDB disconnected. Attempting reconnection...');
      isConnected = false;
    });

    return conn;
  } catch (error) {
    console.error(`[DATABASE ERROR] Failed to connect to MongoDB: ${error.message}`);
    if (env.NODE_ENV === 'production') {
      process.exit(1);
    }
    throw error;
  }
};

module.exports = connectDB;
