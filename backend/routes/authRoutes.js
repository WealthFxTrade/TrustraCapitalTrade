import express from 'express';
import {
    registerUser,
    loginUser,
    logoutUser,
    getUserProfile,
    updateUserProfile,
    refreshSession,
    forgotPassword, // Added to match standard fintech auth flow
    resetPassword  // Added to match standard fintech auth flow
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * ── PUBLIC PROTOCOLS ──
 * Access: Public
 * These endpoints handle entry/exit and recovery.
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
// @route   POST /api/auth/forgot-password
router.post('/forgot-password', forgotPassword);

// @desc    Reset password using token
// @route   PUT /api/auth/reset-password/:resettoken
router.put('/reset-password/:resettoken', resetPassword);

// @desc    Refresh session and validate token version
// @route   POST /api/auth/refresh
router.post('/refresh', refreshSession); 

/**
 * ── SECURE IDENTITY NODE ──
 * Access: Private (Requires Bearer Token)
 */

// @desc    Get current user data
// @route   GET /api/auth/profile
router.get('/profile', protect, getUserProfile);

// @desc    Update user details (Name, Phone, etc.)
// @route   PUT /api/auth/update-profile
router.put('/update-profile', protect, updateUserProfile);

export default router;
