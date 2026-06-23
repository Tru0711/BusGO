const mongoose = require('mongoose');

const connectDB = async () => {
  const connectionCandidates = [
    process.env.MONGO_URI,
    process.env.MONGODB_URI,
    process.env.MONGO_URL,
    'mongodb://127.0.0.1:27017/BusGo',
  ].filter(Boolean);

  let lastError = null;

  for (const candidate of connectionCandidates) {
    try {
      const connection = await mongoose.connect(candidate, {
        serverSelectionTimeoutMS: 5000,
      });

      console.log(`MongoDB connected: ${connection.connection.host}`);
      return connection;
    } catch (error) {
      lastError = error;
    }
  }

  try {
    throw lastError || new Error('Unable to connect to MongoDB.');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    console.error('Server will continue running without a database connection. Check MONGO_URI in backend/.env.');
    return null;
  }
};

module.exports = connectDB;
