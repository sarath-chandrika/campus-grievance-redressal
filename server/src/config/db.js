const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/grievance_db';

  if (/<[^>]+>/.test(mongoUri)) {
    throw new Error('MONGO_URI still contains placeholders. Replace them with your MongoDB Atlas connection details.');
  }

  const conn = await mongoose.connect(mongoUri);
  console.log(`MongoDB Connected: ${conn.connection.host}`);
  return conn;
};

module.exports = connectDB;
