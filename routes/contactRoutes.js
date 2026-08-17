import express from 'express';
import {
  createMessage,
  getMessages,
  updateMessageStatus,
  deleteMessage,
  getStats
} from '../controllers/contactController.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public route for contact form submission
router.post('/', createMessage);

// Protected admin routes for messages management
router.get('/', protectAdmin, getMessages);
router.get('/stats', protectAdmin, getStats);
router.patch('/:id/status', protectAdmin, updateMessageStatus);
router.delete('/:id', protectAdmin, deleteMessage);

export default router;
