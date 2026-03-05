import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res) => {
  const { username, email, password, referralCode } = req.body;

  try {
    // 1. Basic Validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All identification fields required." });
    }

    // 2. Check for existing user
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Identity already registered in the protocol." });
    }

    // 3. Hash Password (if not handled by middleware in User.js)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Initialize User with Rio Protocol Schema
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      referralCode: Math.random().toString(36).substring(7).toUpperCase(),
      referredBy: referralCode || null,
      // Initialize the Mongoose Map
      balances: {
        'EUR': 0,
        'ROI': 0,
        'COMMISSION': 0
      },
      lastRoiAt: null,
      ledger: []
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id),
      });
      console.log(`[AUTH] New Node Initialized: ${username}`);
    } else {
      res.status(400).json({ message: "Invalid user data received." });
    }
  } catch (error) {
    console.error("CRITICAL AUTH ERROR:", error);
    res.status(500).json({ 
      message: "Internal Server Error", 
      error: error.message 
    });
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        activePlan: user.activePlan,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid Cipher or Identity." });
    }
  } catch (error) {
    res.status(500).json({ message: "Authentication protocol failure." });
  }
};
