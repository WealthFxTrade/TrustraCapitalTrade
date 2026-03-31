// backend/routes/auth.js
import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { ApiError } from '../middleware/errorMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ── AES-256-CBC DECRYPTION ──
const decryptAccessCipher = (cipherText) => {
  try {
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
    const iv = Buffer.from(process.env.ENCRYPTION_IV, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(cipherText, 'hex', 'utf8');
    return decrypted + decipher.final('utf8');
  } catch (err) {
    console.error("🚨 [DECODE ERROR]:", err.message);
    return null;
  }
};

// ── JWT GENERATION ──
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// ── 1. LOGIN ──
router.post('/login', async (req, res, next) => {
  try {
    const { email, password: incomingCipher } = req.body;
    if (!email || !incomingCipher) throw new ApiError(400, 'Credentials Incomplete');

    const password = decryptAccessCipher(incomingCipher);
    if (!password) throw new ApiError(401, 'Access Cipher Corrupted');

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      throw new ApiError(401, 'Invalid credentials');
    }

    res.json({
      success: true,
      token: generateToken(user._id, user.role),
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── 2. REGISTER ──
router.post('/register', async (req, res, next) => {
  try {
    const { fullName, email, password: incomingCipher } = req.body;
    if (!fullName || !email || !incomingCipher) throw new ApiError(400, 'All fields are required');

    const password = decryptAccessCipher(incomingCipher);

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) throw new ApiError(409, 'Email already registered');

    const user = await User.create({
      fullName,
      email: email.toLowerCase().trim(),
      password,
    });

    res.status(201).json({
      success: true,
      token: generateToken(user._id, user.role),
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── 3. PROFILE / SESSION VERIFICATION ──
router.get('/profile', protect, async (req, res, next) => {
  try {
    // req.user is already set by authMiddleware
    res.json({ success: true, user: req.user });
  } catch (err) {
    next(err);
  }
});

export default router;
