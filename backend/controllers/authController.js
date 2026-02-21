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

    // 3️⃣ ₿ BITCOIN LOGIC: Get unique index and generate address
    // Find the counter doc, increment it, or create it if it doesn't exist
    const counterDoc = await User.findOneAndUpdate(
      { isCounter: true },
      { $inc: { btcIndexCounter: 1 } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const nextIndex = counterDoc.btcIndexCounter;
    const uniqueBtcAddress = generateBitcoinAddress(process.env.BITCOIN_XPUB, nextIndex);

    // 4️⃣ Create New User
    const newUser = await User.create({
      fullName,
      email: emailLower,
      password, // Hashing is handled by userSchema.pre('save')
      phone,
      btcAddress: uniqueBtcAddress,
      btcIndex: nextIndex,
      // Initialize balances via Map as defined in your schema
      balances: new Map([
        ['BTC', 0],
        ['EUR', 0],
        ['EUR_PROFIT', 0],
        ['USDT', 0]
      ])
    });

    // 5️⃣ JWT Token Generation
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
    );

    // 6️⃣ Response
    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        btcAddress: newUser.btcAddress,
        balances: Object.fromEntries(newUser.balances)
      }
    });

  } catch (err) {
    // Handle MongoDB Duplicate Key Errors (e.g., if index somehow clashes)
    if (err.code === 11000) {
      return next(new ApiError(400, 'Registration failed: Duplicate unique data detected.'));
    }
    next(err);
  }
};

