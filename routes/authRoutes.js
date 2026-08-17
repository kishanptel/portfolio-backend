import express from 'express';
import { adminLogin, verifyAdminToken } from '../controllers/authController.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', adminLogin);
router.get('/verify', protectAdmin, verifyAdminToken);

export default router;
