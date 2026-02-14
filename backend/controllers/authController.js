import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs'; // Better for Termux than 'bcrypt'
import { ApiError } from '../middleware/errorMiddleware.js';

/**
 * @desc    Generate JWT Token
 */
const generateToken = (id, isAdmin) => {
  return jwt.sign(
    { id, isAdmin }, 
    process.env.JWT_SECRET || 'rio_2026_secret_key', 
    { expiresIn: '30d' }
  );
};

/**
 * @desc    Login User & Get Token
 * @route   POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Validation
    if (!email || !password) {
      throw new ApiError(400, 'Please provide email and password');
    }

    // 2. Find User (Include password field which is hidden by default in Schema)
    const user = await User.findOne({ 
      email: email.toLowerCase().trim() 
    }).select('+password');

    if (!user) {
      // 🔒 Generic message to prevent user enumeration
      throw new ApiError(401, 'Invalid credentials');
    }

    // 3. Verify Password using the method in your User model
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid credentials');
    }

    // 4. Update last login (optional but recommended for Admin Audit)
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    // 5. Send Success Response
    res.status(200).json({
      success: true,
      token: generateToken(user._id, user.isAdmin),
      user: {
        id: user._id,
        email: user.email,
        isAdmin: user.isAdmin,
        role: user.role,
        name: user.name
      }
    });

  } catch (err) {
    next(err); // Handled by global error middleware
  }
};

/**
 * @desc    Register New User
 * @route   POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // 1. Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      throw new ApiError(400, 'User with this email already exists');
    }

    // 2. Create User (password hashing is handled by pre-save in User.js)
    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password,
    });

    if (user) {
      res.status(201).json({
        success: true,
        token: generateToken(user._id, user.isAdmin),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin
        }
      });
    }
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get Current Logged-in User Profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};
