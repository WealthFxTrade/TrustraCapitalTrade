import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { ApiError } from '../middleware/errorMiddleware.js';
import { sendEmail } from '../utils/sendEmail.js'; 
import { protect } from '../middleware/authMiddleware.js'; // Ensure this exists

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

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// ── 1. AUTHENTICATE ACCESS (LOGIN) ──
router.post('/login', async (req, res, next) => {
  try {
    const { email, password: incomingCipher } = req.body;
    if (!email || !incomingCipher) throw new ApiError(400, 'Credentials Incomplete');

    const password = decryptAccessCipher(incomingCipher);
    if (!password) throw new ApiError(401, 'Access Cipher Corrupted');

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
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

// ── 2. GET CURRENT SESSION (REQUIRED FOR FRONTEND INIT) ──
// Matches AuthContext.jsx -> api.get('/auth/me')
router.get('/me', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) throw new ApiError(404, 'Identity not found');

    res.json({
      success: true,
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

// ── 3. REQUEST WITHDRAWAL OTP ──
router.post('/request-otp', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) throw new ApiError(400, 'Email protocol required');

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) throw new ApiError(404, 'Identity not found in Node');

    // Generate 6-digit cryptographic OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save to User document (expires in 5 mins)
    user.otpCode = otp;
    user.otpExpires = Date.now() + 300000;
    await user.save({ validateBeforeSave: false });

    // Dispatch via Trustra Mail Gateway
    await sendEmail({
      email: user.email,
      subject: "Security Protocol: [Withdrawal OTP]",
      otp: otp, 
      message: "An authorization code has been requested for your Elite Yield withdrawal."
    });

    res.json({
      success: true,
      message: 'Security Protocol Dispatched to Registered Email'
    });
  } catch (err) { next(err); }
});

export default router;

