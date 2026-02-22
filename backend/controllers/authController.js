import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { ApiError } from '../middleware/errorMiddleware.js';
import { generateBitcoinAddress } from '../utils/bitcoinUtils.js';

/**
 * 🟢 REGISTER NEW USER (With Atomic BTC Address Generation)
 */
export const register = async (req, res, next) => {
  try {
    const { fullName, email, password, phone } = req.body;

    // 1️⃣ Basic Input Validation
    if (!fullName || !email || !password) {
      throw new ApiError(400, 'Please provide all required fields: Name, Email, Password');
    }

    const emailLower = email.toLowerCase().trim();

    // 2️⃣ Check if User already exists
    const existingUser = await User.findOne({ email: emailLower });
    if (existingUser) {
      throw new ApiError(400, 'A user with this email already exists');
    }

    // 3️⃣ ₿ BITCOIN LOGIC: Atomic Counter for xPub Indexing
    // We use { isCounter: true } as a filter to keep one global tracking doc
    const counterDoc = await User.findOneAndUpdate(
      { email: "system_counter@trustra.internal" }, // Specific hidden doc for index tracking
      { $inc: { btcIndexCounter: 1 } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const nextIndex = counterDoc.btcIndexCounter;
    
    // Ensure BITCOIN_XPUB is set in Render Env or this will throw an error
    if (!process.env.BITCOIN_XPUB) {
      console.error("[CRITICAL] BITCOIN_XPUB missing from Environment Variables");
      throw new ApiError(500, 'Server configuration error');
    }

    const uniqueBtcAddress = generateBitcoinAddress(process.env.BITCOIN_XPUB, nextIndex);

    // 4️⃣ Create New User
    const newUser = await User.create({
      fullName,
      email: emailLower,
      password, // Hashing MUST be in UserSchema.pre('save')
      phone,
      btcAddress: uniqueBtcAddress,
      btcIndex: nextIndex,
      role: 'user', // Explicitly set default role
      isActive: true, // Required for your protect middleware
      balances: new Map([
        ['BTC', 0],
        ['EUR', 0],
        ['EUR_PROFIT', 0],
        ['USDT', 0]
      ])
    });

    // 5️⃣ JWT Token Generation (Include ID and Role for Middleware)
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
    );

    // 6️⃣ Response (Flatten balances for Frontend ease)
    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
        btcAddress: newUser.btcAddress,
        balances: Object.fromEntries(newUser.balances)
      }
    });

  } catch (err) {
    if (err.code === 11000) {
      return next(new ApiError(400, 'Registration failed: Duplicate email detected.'));
    }
    next(err);
  }
};

