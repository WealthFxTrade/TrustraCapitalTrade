/**
 * models/User.js
 * Mongoose schema and model for Trustra Capital users
 * Defines user identity, balances, referral system, KYC status, security flags,
 * ledger history, password hashing, and automatic referral code generation.
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// ── Ledger Entry Sub-Schema ──────────────────────────────────────────────────────────
// Stores individual transaction records for deposits, withdrawals, yields, etc.
const ledgerSchema = mongoose.Schema(
  {
    // Amount of the transaction (positive or negative)
    amount: {
      type: Number,
      required: [true, 'Transaction amount is required'],
    },

    // Currency of the transaction (defaults to EUR)
    currency: {
      type: String,
      default: 'EUR',
      enum: ['EUR', 'BTC', 'USDT', 'ROI'],
    },

    // Type of transaction
    type: {
      type: String,
      enum: [
        'deposit',
        'withdrawal',
        'yield',
        'investment',
        'transfer',
        'referral_bonus',
        'override',
      ],
      required: [true, 'Transaction type is required'],
    },

    // Status of the transaction
    status: {
      type: String,
      enum: ['pending', 'completed', 'rejected', 'cancelled'],
      default: 'pending',
    },

    // Blockchain address or reference (for deposits/withdrawals)
    address: {
      type: String,
    },

    // Human-readable description of the transaction
    description: {
      type: String,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// ── Main User Schema ─────────────────────────────────────────────────────────────────
const userSchema = mongoose.Schema(
  {
    // ── Basic Identity Fields ────────────────────────────────────────────────────────
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },

    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
      match: [
        /^[a-zA-Z0-9_]+$/,
        'Username can only contain letters, numbers, and underscores',
      ],
    },

    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },

    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^\+?\d{9,15}$/, 'Please provide a valid phone number'],
    },

    // ── Authentication & Security Fields ─────────────────────────────────────────────
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Exclude password from normal queries
    },

    // ── Role & Account Status ────────────────────────────────────────────────────────
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isBanned: {
      type: Boolean,
      default: false,
    },

    kycStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected', 'unsubmitted'],
      default: 'unsubmitted',
    },

    // ── Referral System Fields ───────────────────────────────────────────────────────
    referralCode: {
      type: String,
      unique: true,
      // Auto-generated in pre-save hook (8-character uppercase alphanumeric)
    },

    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // ── Balances & Financial Tracking ────────────────────────────────────────────────
    balances: {
      type: Map,
      of: Number,
      // Default balances when a new user is created
      default: () => new Map([
        ['EUR', 0],
        ['ROI', 0],
        ['BTC', 0],
        ['USDT', 0],
        ['INVESTED', 0], // Added to track initial invested amount
      ]),
    },

    totalBalance: {
      type: Number,
      default: 0,
    },

    totalProfit: {
      type: Number,
      default: 0,
    },

    activePlan: {
      type: String,
      default: 'none',
    },

    lastRoiAt: {
      type: Date,
      default: null,
    },

    // ── Transaction History ──────────────────────────────────────────────────────────
    ledger: [ledgerSchema],

    // ── Timestamps ───────────────────────────────────────────────────────────────────
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
    toJSON: { virtuals: true, flattenMaps: false },
    toObject: { virtuals: true, flattenMaps: false },
  }
);

// ── Pre-save Hook: Hash Password ─────────────────────────────────────────────────────
// Automatically hash the password before saving (on create & update)
userSchema.pre('save', async function (next) {
  // Only hash if the password field has been modified
  if (!this.isModified('password')) {
    return next();
  }

  // Generate salt and hash the password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

// ── Pre-save Hook: Generate Referral Code ────────────────────────────────────────────
// Automatically generate unique referral code for new users
userSchema.pre('save', async function (next) {
  if (this.isNew && !this.referralCode) {
    // Generate 8-character uppercase alphanumeric code
    let code = Math.random().toString(36).substring(2, 10).toUpperCase();

    // Check for collision (very rare but possible)
    let collision = await this.constructor.findOne({ referralCode: code });
    while (collision) {
      code = Math.random().toString(36).substring(2, 10).toUpperCase();
      collision = await this.constructor.findOne({ referralCode: code });
    }

    this.referralCode = code;
  }

  next();
});

// ── Instance Method: Compare Password ────────────────────────────────────────────────
// Used during login to verify provided password against stored hash
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ── Export the User model ────────────────────────────────────────────────────────────
const User = mongoose.model('User', userSchema);

export default User;
