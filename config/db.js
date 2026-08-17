import 'dotenv/config';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

let isMongoConnected = false;

// Ensure local data store directory and file exist for fallback
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(
    DATA_FILE,
    JSON.stringify({ messages: [], admins: [] }, null, 2)
  );
}

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  const dbName = process.env.DATABASE_NAME || 'portfolio';

  if (!uri) {
    console.log('[Database Notice]: No MONGO_URI provided. Running in local JSON storage mode.');
    isMongoConnected = false;
    return null;
  }

  if (cached.conn && mongoose.connection.readyState === 1) {
    isMongoConnected = true;
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      dbName: dbName,
      serverSelectionTimeoutMS: 8000,
    };
    cached.promise = mongoose.connect(uri, opts).then((m) => {
      isMongoConnected = true;
      console.log(`[MongoDB Connected]: ${m.connection.host} / Database: ${m.connection.name}`);
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
    isMongoConnected = true;
  } catch (error) {
    cached.promise = null;
    isMongoConnected = false;
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    console.log(`[Database Notice]: Running in resilient local JSON storage mode.`);
  }

  return cached.conn;
};

export const getDbStatus = () => isMongoConnected;

// File-based Storage helpers
export const readStore = () => {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return { messages: [], admins: [] };
  }
};

export const writeStore = (data) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Error writing to store:', e);
  }
};
