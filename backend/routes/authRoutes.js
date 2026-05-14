// backend/routes/authRoutes.js
import express from 'express';
import {
    registerUser,
    loginUser,
    logoutUser,
    getUserProfile,
    updateUserProfile,
    refreshSession,
    forgotPassword,
    resetPassword
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * ── PUBLIC PROTOCOLS ──
 * Access: Public
 */

// @desc    Register a new user & auto-assign crypto index
// @route   POST /api/auth/register
router.post('/register', registerUser);

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
router.post('/login', loginUser);

// @desc    Clear session & cookies
// @route   POST /api/auth/logout
router.post('/logout', logoutUser);

// @desc    Generate password reset token
// @route   POST /api/auth/forgotpassword
// FIXED: Adjusted to perfectly match your production controller signature mapping
router.post('/forgotpassword', forgotPassword);

// @desc    Reset password using token
// @route   PUT /api/auth/resetpassword/:resettoken
// FIXED: Aligned URI path naming context with your unshortened controller signature
router.put('/resetpassword/:resettoken', resetPassword);

// @desc    Refresh session and validate token version
// @route   POST /api/auth/refresh
router.post('/refresh', refreshSession);

/**
 * ── SECURE IDENTITY NODE ──
 * Access: Private (Requires HTTP-Only cookie / Authentication middleware)
 */

// @desc    Get current user data
// @route   GET /api/auth/profile
router.get('/profile', protect, getUserProfile);

// @desc    Update user details (Name, Password, etc.)
// @route   PUT /api/auth/profile
// FIXED: Changed from /update-profile to /profile to accurately connect with your controller
router.put('/profile', protect, updateUserProfile);

export default router;

