import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { ApiError } from '../middleware/errorMiddleware.js';
import { deriveBtcAddress } from '../utils/bitcoinUtils.js';

/**
 * ── TOKEN GENERATION ──
 * Includes 'version' to support session revocation
 */
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            version: user.tokenVersion || 0
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// @desc    Register a new user with unique BTC vault
// @route   POST /api/auth/register
export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        throw new ApiError(400, 'All fields are required');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ApiError(400, 'User identity already exists in ledger');
    }

    // Find next available HD wallet index
    const lastUser = await User.findOne().sort({ address_index: -1 });
    const nextIndex = lastUser && lastUser.address_index !== undefined ? lastUser.address_index + 1 : 0;

    // Derive unique institutional address
    const { address } = deriveBtcAddress(nextIndex);

    const user = await User.create({
        name,
        email,
        password,
        address_index: nextIndex,
        tokenVersion: 0,
        balances: new Map([
            ['EUR', 0],
            ['BTC', 0],
            ['ROI', 0],
            ['BTC_ADDRESS', address]
        ]),
    });

    const token = generateToken(user);

    res.cookie('trustra_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
    });

    res.status(201).json({
        success: true,
        user: { id: user._id, name: user.name, email: user.email, btcAddress: address },
        token,
    });
});

// @desc    Authenticate user & issue versioned token
// @route   POST /api/auth/login
export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
        throw new ApiError(401, 'Invalid credentials');
    }

    const token = generateToken(user);

    res.cookie('trustra_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
    });

    res.json({
        success: true,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            balances: Object.fromEntries(user.balances),
        },
        token,
    });
});

// @desc    Check & Refresh Session Validity
// @route   POST /api/auth/refresh
export const refreshSession = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) throw new ApiError(401, 'Session revoked');

    const token = generateToken(user);
    res.json({ success: true, token });
});

// @desc    Get user profile data
// @route   GET /api/auth/profile
export const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) throw new ApiError(404, 'Profile not found');

    res.json({
        success: true,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            balances: Object.fromEntries(user.balances),
            kycStatus: user.kycStatus
        },
    });
});

// @desc    Update Identity Node Information
// @route   PUT /api/auth/update-profile
export const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) throw new ApiError(404, 'Identity Node not found');

    if (req.body.name) user.name = req.body.name;
    if (req.body.password) {
        user.password = req.body.password;
        // Increment version to logout other devices on password change
        user.tokenVersion = (user.tokenVersion || 0) + 1;
    }

    const updatedUser = await user.save();
    const token = generateToken(updatedUser);

    res.json({
        success: true,
        message: 'Identity Node synchronized',
        token,
        user: { id: updatedUser._id, name: updatedUser.name }
    });
});

// @desc    Forgot Password - Generate Token
// @route   POST /api/auth/forgot-password
export const forgotPassword = asyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        throw new ApiError(404, 'No user found with that email');
    }

    const resetToken = user.getResetPasswordToken(); // Ensure this method exists in User model
    await user.save({ validateBeforeSave: false });

    // In a real app, send this via email. For now, returning in response.
    res.json({
        success: true,
        message: 'Reset token generated',
        resetToken 
    });
});

// @desc    Reset Password
// @route   PUT /api/auth/reset-password/:resettoken
export const resetPassword = asyncHandler(async (req, res) => {
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resettoken)
        .digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        throw new ApiError(400, 'Invalid or expired token');
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.tokenVersion = (user.tokenVersion || 0) + 1;

    await user.save();

    const token = generateToken(user);
    res.json({ success: true, message: 'Password updated', token });
});

// @desc    Revoke session and clear cookies
// @route   POST /api/auth/logout
export const logoutUser = asyncHandler(async (req, res) => {
    res.cookie('trustra_token', '', {
        httpOnly: true,
        expires: new Date(0),
        path: '/',
    });
    res.json({ success: true, message: 'Identity Node disconnected' });
});
