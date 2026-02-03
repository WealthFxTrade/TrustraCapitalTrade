import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Helper to generate JWT (unchanged, but ensured safe usage)
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Login user
// @route   POST /api/auth/login
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // 1. Basic input validation
  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }

  // 2. Find user and explicitly include hashed password
  const user = await User.findOne({ email }).select('+password');

  // 3. No user found → standard 401 (do not reveal "email not found" vs "wrong password")
  if (!user) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  // 4. Verify password using model method
  let isMatch;
  try {
    isMatch = await user.comparePassword(password);
  } catch (err) {
    // Catch bcrypt or other unexpected errors (e.g. corrupted password field)
    console.error('Password comparison failed:', err);
    res.status(500);
    throw new Error('Authentication error');
  }

  // 5. Password mismatch → same 401 message
  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  // 6. Success response – only expose safe fields
  res.status(200).json({
    success: true,
    user: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,          // optional – remove if you don't want to expose email
      role: user.role,
      plan: user.plan,
      isVerified: user.isVerified,
      isActive: user.isActive,
    },
    token: generateToken(user._id),
  });
});
