import jwt from 'jsonwebtoken';
import { AdminModel } from '../models/Admin.js';

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const isValid = await AdminModel.verifyCredentials(email, password);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const secret = process.env.JWT_SECRET || 'portfolio_super_secure_jwt_secret_key_2026_kp';
    const token = jwt.sign(
      { email: email.toLowerCase(), role: 'admin' },
      secret,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Admin login successful.',
      token,
      admin: {
        email: email.toLowerCase(),
        role: 'admin'
      }
    });
  } catch (error) {
    console.error('Admin Login Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication.'
    });
  }
};

export const verifyAdminToken = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Token is valid.',
    admin: req.admin
  });
};
