import 'dotenv/config';
import mongoose from 'mongoose';

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const uri = process.env.MONGO_URI;
  const dbName = process.env.DATABASE_NAME || 'portfolio';

  if (!uri) {
    console.error('[MongoDB Error]: MONGO_URI is missing in environment variables.');
    throw new Error('MONGO_URI is missing');
  }

  try {
    const conn = await mongoose.connect(uri, {
      dbName: dbName,
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`[MongoDB Connected]: ${conn.connection.host} / Database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    throw error;
  }
};

export const getDbStatus = () => mongoose.connection.readyState === 1;
