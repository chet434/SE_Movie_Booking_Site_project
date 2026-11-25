const mongoose = require('mongoose');

// Enable Mongoose query sanitization filter (Express 5 compatible)
mongoose.set('sanitizeFilter', true);

const connectDB = async () => {
  try {
    const maxPoolSize = parseInt(process.env.MONGODB_MAX_POOL_SIZE) || 10;
    const minPoolSize = parseInt(process.env.MONGODB_MIN_POOL_SIZE) || 5;
    const serverSelectionTimeout = parseInt(process.env.MONGODB_SERVER_SELECTION_TIMEOUT) || 5000;
    const socketTimeout = parseInt(process.env.MONGODB_SOCKET_TIMEOUT) || 45000;

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize,
      minPoolSize,
      serverSelectionTimeoutMS: serverSelectionTimeout,
      socketTimeoutMS: socketTimeout,
      bufferCommands: false,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Pool size: min=${minPoolSize}, max=${maxPoolSize}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
