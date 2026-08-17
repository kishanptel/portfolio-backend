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

export const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  const dbName = process.env.DATABASE_NAME || 'portfolio';

  if (!uri) {
    console.log('[Database Notice]: No MONGO_URI provided in .env. Running in local JSON storage mode.');
    isMongoConnected = false;
    return;
  }

  try {
    const conn = await mongoose.connect(uri, {
      dbName: dbName,
      serverSelectionTimeoutMS: 5000,
    });
    isMongoConnected = true;
    console.log(`[MongoDB Connected]: ${conn.connection.host} / Database: ${conn.connection.name}`);
  } catch (error) {
    isMongoConnected = false;
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    console.log(`[Database Notice]: Running in resilient local JSON storage mode.`);
  }
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
