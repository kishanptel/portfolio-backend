import mongoose from 'mongoose';
import { getDbStatus, readStore, writeStore } from '../config/db.js';

const messageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    subject: { type: String, default: 'Portfolio Inquiry', trim: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ['unread', 'read', 'archived'],
      default: 'unread'
    },
    ip: { type: String },
    userAgent: { type: String }
  },
  { timestamps: true }
);

const MongoMessage = mongoose.model('Message', messageSchema);

// Hybrid model adapter ensuring seamless operation in Mongo or file storage
export const MessageModel = {
  create: async (data) => {
    if (getDbStatus()) {
      return await MongoMessage.create(data);
    }
    const store = readStore();
    const newMsg = {
      _id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      name: data.name,
      email: data.email,
      subject: data.subject || 'Portfolio Inquiry',
      message: data.message,
      status: 'unread',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    store.messages.unshift(newMsg);
    writeStore(store);
    return newMsg;
  },

  find: async (query = {}, sort = { createdAt: -1 }) => {
    if (getDbStatus()) {
      return await MongoMessage.find(query).sort(sort);
    }
    const store = readStore();
    let msgs = [...store.messages];
    if (query.status) {
      msgs = msgs.filter((m) => m.status === query.status);
    }
    if (query.$or) {
      // Basic text search in name, email, message, subject
      const regex = query.$or[0]?.name?.$regex;
      if (regex) {
        const pattern = new RegExp(regex, 'i');
        msgs = msgs.filter(
          (m) =>
            pattern.test(m.name) ||
            pattern.test(m.email) ||
            pattern.test(m.subject) ||
            pattern.test(m.message)
        );
      }
    }
    return msgs;
  },

  findById: async (id) => {
    if (getDbStatus()) {
      return await MongoMessage.findById(id);
    }
    const store = readStore();
    return store.messages.find((m) => m._id === id);
  },

  findByIdAndUpdate: async (id, updateData, options = {}) => {
    if (getDbStatus()) {
      return await MongoMessage.findByIdAndUpdate(id, updateData, { new: true });
    }
    const store = readStore();
    const index = store.messages.findIndex((m) => m._id === id);
    if (index === -1) return null;
    store.messages[index] = {
      ...store.messages[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    writeStore(store);
    return store.messages[index];
  },

  findByIdAndDelete: async (id) => {
    if (getDbStatus()) {
      return await MongoMessage.findByIdAndDelete(id);
    }
    const store = readStore();
    const index = store.messages.findIndex((m) => m._id === id);
    if (index === -1) return null;
    const deleted = store.messages.splice(index, 1)[0];
    writeStore(store);
    return deleted;
  },

  countDocuments: async (query = {}) => {
    if (getDbStatus()) {
      return await MongoMessage.countDocuments(query);
    }
    const store = readStore();
    if (!query || Object.keys(query).length === 0) return store.messages.length;
    if (query.status) {
      return store.messages.filter((m) => m.status === query.status).length;
    }
    return store.messages.length;
  }
};
