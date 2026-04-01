// backend/routes/authRoutes.js
import express from 'express';
import {
  loginUser,
  registerUser,
  getUserProfile,
  logoutUser,
  forgotPassword,
  resetPassword
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/auth/health
 * @desc    Check if Auth Service is operational
 * @access  Public
 */
router.get('/health', (req, res) => res.json({ status: 'Auth System Online' }));

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', registerUser);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/login', loginUser);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset email
 * @access  Public
 */
router.post('/forgot-password', forgotPassword);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password using token
 * @access  Public
 */
router.post('/reset-password', resetPassword);

/**
 * @route   GET /api/auth/profile
 * @desc    Get user profile data
 * @access  Private
 */
router.get('/profile', protect, getUserProfile);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user / clear cookie
 * @access  Private
 */
router.post('/logout', protect, logoutUser);

export default router;
