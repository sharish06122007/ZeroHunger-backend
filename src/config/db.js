// config/db.js – MongoDB connection module
const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Modern mongoose options (can be blank or customized)
    });
    logger.info(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    logger.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

// Handle graceful termination
process.on('SIGINT', async () => {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected through app termination');
  process.exit(0);
});

module.exports = connectDB;
