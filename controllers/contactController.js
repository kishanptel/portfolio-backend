import { MessageModel } from '../models/Message.js';

// Public endpoint to receive portfolio inquiry
export const createMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required fields.'
      });
    }

    // Email regex check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    const newMessage = await MessageModel.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject?.trim() || 'Portfolio Inquiry',
      message: message.trim(),
      status: 'unread',
      ip: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent']
    });

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your message has been received successfully.',
      data: newMessage
    });
  } catch (error) {
    console.error('Create Message Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit message. Please try again later.'
    });
  }
};

// Admin protected endpoints
export const getMessages = async (req, res) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (status && ['unread', 'read', 'archived'].includes(status)) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    const messages = await MessageModel.find(query, { createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    console.error('Get Messages Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch messages.'
    });
  }
};

export const updateMessageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['unread', 'read', 'archived'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value. Must be "unread", "read", or "archived".'
      });
    }

    const updated = await MessageModel.findByIdAndUpdate(id, { status });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Message not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: `Message marked as ${status}.`,
      data: updated
    });
  } catch (error) {
    console.error('Update Status Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update message status.'
    });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await MessageModel.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Message not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Message deleted successfully.'
    });
  } catch (error) {
    console.error('Delete Message Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete message.'
    });
  }
};

export const getStats = async (req, res) => {
  try {
    const total = await MessageModel.countDocuments({});
    const unread = await MessageModel.countDocuments({ status: 'unread' });
    const read = await MessageModel.countDocuments({ status: 'read' });
    const archived = await MessageModel.countDocuments({ status: 'archived' });

    return res.status(200).json({
      success: true,
      stats: {
        total,
        unread,
        read,
        archived
      }
    });
  } catch (error) {
    console.error('Get Stats Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve stats.'
    });
  }
};
