import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { ApiError } from '../middleware/errorMiddleware.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Find user and include password for verification
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      if (user.isBanned) {
        throw new ApiError(403, "Access Revoked. Contact Zurich HQ.");
      }

      res.json({
        success: true,
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        // Convert Map to Object for Frontend compatibility
        balances: Object.fromEntries(user.balances),
        token: generateToken(user._id),
      });
    } else {
      throw new ApiError(401, "Invalid Access Cipher or Protocol Email.");
    }
  } catch (error) {
    next(error); // This sends the error to your errorHandler middleware
  }
};

export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) throw new ApiError(400, "Node already exists in registry.");

    // Create user with default Rio Protocol balances
    const user = await User.create({
      username,
      email,
      password,
      balances: {
        'EUR': 0,
        'ROI': 0,
        'BTC': 0
      }
    });

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        username: user.username,
        balances: Object.fromEntries(user.balances)
      }
    });
  } catch (error) {
    next(error);
  }
};
