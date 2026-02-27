// backend/routes/auth.js
import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { deriveBtcAddress } from '../utils/bitcoinUtils.js';
import { ApiError } from '../middleware/errorMiddleware.js';

const router = express.Router();

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// ── REGISTER NEW INVESTOR ──
router.post('/register', async (req, res, next) => {
  try {
    const { fullName, email, password, phone } = req.body;

    // Check if user exists before incrementing the HD Wallet Counter
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) throw new ApiError(400, 'Identity already registered in Trustra Node');

    // Atomic increment of the Global BTC Index Counter
    const counter = await User.findOneAndUpdate(
      { isCounter: true },
      { $inc: { btcIndexCounter: 1 } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Derive a unique, deterministic SegWit/Taproot address for this user
    const btcAddress = deriveBtcAddress(process.env.BITCOIN_XPUB, counter.btcIndexCounter);

    const newUser = await User.create({
      fullName,
      email: email.toLowerCase(),
      phone,
      password,
      btcIndex: counter.btcIndexCounter,
      btcAddress,
      isCounter: false
    });

    res.status(201).json({ 
      success: true, 
      token: generateToken(newUser._id, newUser.role), 
      user: { 
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
        btcAddress: newUser.btcAddress 
      } 
    });
  } catch (err) { next(err); }
});

// ── AUTHENTICATE ACCESS ──
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Select password explicitly as it is marked 'select: false' in the Model
    const user = await User.findOne({ 
      email: email.toLowerCase(), 
      isCounter: { $ne: true } 
    }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      throw new ApiError(401, 'Invalid credentials provided to Trustra Node');
    }

    res.json({ 
      success: true, 
      token: generateToken(user._id, user.role), 
      user: { 
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        btcAddress: user.btcAddress 
      } 
    });
  } catch (err) { next(err); }
});

// CRITICAL EXPORT FOR server.js
export default router;

