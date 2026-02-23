import User from '../models/User.js';
import Counter from '../models/Counter.js';
import jwt from 'jsonwebtoken';
import { ApiError } from '../middleware/errorMiddleware.js';
import { generateBitcoinAddress } from '../utils/bitcoinUtils.js';

// ──────────────────────────────────────────────
// CONSTANTS
// ──────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;
const TOKEN_EXPIRY = process.env.JWT_EXPIRES_IN || '7d';

// ──────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────

/**
 * Build a signed JWT for a given user.
 * Throws at boot-time if JWT_SECRET is missing.
 */
function signToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new ApiError(500, 'Server configuration error: missing JWT secret');
  }
  return jwt.sign(
    { id: user._id, role: user.role },
    secret,
    { expiresIn: TOKEN_EXPIRY }
  );
}

/**
 * Sanitize user object for client response.
 */
function sanitizeUser(user) {
  return {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    btcAddress: user.btcAddress,
    balances: { ...user.balances.toObject?.() ?? user.balances }
  };
}

// ──────────────────────────────────────────────
// REGISTER
// ──────────────────────────────────────────────

/**
 * POST /api/auth/register
 * Creates a new user with a unique BTC deposit address.
 */
export const register = async (req, res, next) => {
  try {
    const { fullName, email, password, phone } = req.body;

    // ── 1. Input Validation ──────────────────
    if (!fullName?.trim() || !email?.trim() || !password) {
      throw new ApiError(400, 'Please provide all required fields: Name, Email, Password');
    }

    const emailLower = email.toLowerCase().trim();

    if (!EMAIL_REGEX.test(emailLower)) {
      throw new ApiError(400, 'Please provide a valid email address');
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
      throw new ApiError(400, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`);
    }

    // ── 2. BTC Address Generation (Atomic Counter) ──
    if (!process.env.BITCOIN_XPUB) {
      console.error('[CRITICAL] BITCOIN_XPUB missing from environment variables');
      throw new ApiError(500, 'Server configuration error');
    }

    // Counter lives in its own collection — never pollutes User queries
    const counterDoc = await Counter.findOneAndUpdate(
      { name: 'btc_address_index' },
      { $inc: { seq: 1 } },
      { upsert: true, new: true }
    );

    const btcIndex = counterDoc.seq;
    const btcAddress = generateBitcoinAddress(process.env.BITCOIN_XPUB, btcIndex);

    if (!btcAddress) {
      throw new ApiError(500, 'Failed to generate deposit address');
    }

    // ── 3. Create User ──────────────────────
    // Skip the findOne race — rely on the unique index + error handler below
    let newUser;
    try {
      newUser = await User.create({
        fullName: fullName.trim(),
        email: emailLower,
        password,
        phone: phone?.trim(),
        btcAddress,
        role: 'user',
        isActive: true,
        balances: {
          BTC: 0,
          EUR: 0,
          EUR_PROFIT: 0,
          USDT: 0
        }
      });
    } catch (err) {
      // Duplicate email — unique index caught the race
      if (err.code === 11000) {
        throw new ApiError(409, 'A user with this email already exists');
      }
      throw err;
    }

    // ── 4. Sign Token ────────────────────────
    const token = signToken(newUser);

    // ── 5. Respond ───────────────────────────
    res.status(201).json({
      success: true,
      token,
      user: sanitizeUser(newUser)
    });

  } catch (err) {
    next(err);
  }
};
