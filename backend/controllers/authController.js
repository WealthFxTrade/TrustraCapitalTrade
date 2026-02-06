import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ApiError } from '../middleware/errorMiddleware.js';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { fullName, email, password, phone } = req.body;

    // 1. Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) throw new ApiError(400, 'User with this email already exists');

    // 2. Create the user (Password hashing is handled in User.js pre-save hook)
    const user = await User.create({
      fullName,
      email,
      password,
      phone: phone || '' // Optional phone during registration
    });

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Find user and explicitly select password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // 2. Check if account is restricted
    if (user.banned || !user.isActive) {
      throw new ApiError(403, 'Account is suspended. Please contact support.');
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
};

