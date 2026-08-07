// config/db.js – MongoDB connection module
const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async () => {
  const rawPrimaryUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/zerohunger';
  const primaryUri = String(rawPrimaryUri).trim().replace(/;+$/, '');
  const fallbackUri = 'mongodb://127.0.0.1:27017/zerohunger';

  try {
    const conn = await mongoose.connect(primaryUri, {
      // Modern mongoose options (can be blank or customized)
    });
    logger.info(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    if (primaryUri !== fallbackUri) {
      logger.warn(`Primary MongoDB connection failed, retrying with local fallback: ${fallbackUri}`);
      try {
        const conn = await mongoose.connect(fallbackUri, {
          // Modern mongoose options (can be blank or customized)
        });
        logger.info(`MongoDB connected: ${conn.connection.host}`);
        return conn;
      } catch (fallbackErr) {
        logger.error('MongoDB connection error:', fallbackErr);
        throw fallbackErr;
      }
    }

    logger.error('MongoDB connection error:', err);
    throw err;
  }
};

// Handle graceful termination
process.on('SIGINT', async () => {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected through app termination');
  process.exit(0);
});

module.exports = connectDB;
