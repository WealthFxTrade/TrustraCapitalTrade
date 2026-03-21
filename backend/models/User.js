/**
 * models/User.js
 * Comprehensive User Model for Trustra Capital
 * Includes: Identity, Financial Balances (Map), Referral System, and Ledger.
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// ── Ledger Entry Sub-Schema ──────────────────────────────────────────────────────────
const ledgerSchema = mongoose.Schema(
  {
    amount: {
      type: Number,
      required: [true, 'Transaction amount is required'],
    },
    currency: {
      type: String,
      default: 'EUR',
      enum: ['EUR', 'BTC', 'ETH', 'USDT', 'ROI'],
    },
    type: {
      type: String,
      enum: ['deposit', 'withdrawal', 'yield', 'investment', 'transfer', 'referral_bonus', 'override'],
      required: [true, 'Transaction type is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'rejected', 'cancelled'],
      default: 'pending',
    },
    address: { type: String },
    description: { type: String },
  },
  { timestamps: true }
);

// ── Main User Schema ─────────────────────────────────────────────────────────────────
const userSchema = mongoose.Schema(
  {
    // ── Basic Identity ──
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
    },

    // ── Authentication & Security ──
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false, 
    },

    // ── Account Status & Roles ──
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isActive: { type: Boolean, default: true },
    isBanned: { type: Boolean, default: false },
    kycStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected', 'unsubmitted'],
      default: 'unsubmitted',
    },
    
    // ⚡ FIX: Required for scripts/trigger-rio-daily.js and UI Terminal
    isNodeActive: {
      type: Boolean,
      default: false,
    },

    // ── Referral System ──
    referralCode: {
      type: String,
      unique: true,
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // ── Balances & Financials ──
    // ⚡ ALIGNMENT: Matches Terminal UI keys and ROI script targets
    balances: {
      type: Map,
      of: Number,
      default: () => new Map([
        ['EUR', 0],
        ['ROI', 0],        // Accrued Yield shown in UI
        ['BTC', 0],
        ['ETH', 0],
        ['USDT', 0],
        ['INVESTED', 0],  // Basis for daily ROI calculation script
      ]),
    },

    totalBalance: { type: Number, default: 0 }, // Global portfolio value in EUR
    totalProfit: { type: Number, default: 0 },  // Lifetime ROI earned
    activePlan: { type: String, default: 'none' },
    lastRoiAt: { type: Date, default: null },   // Tracked by ROI script

    // ── History ──
    ledger: [ledgerSchema],
  },
  {
    timestamps: true,
    // ⚡ FIX: flattenMaps: true converts the Mongoose Map to a regular JS object { EUR: 0, BTC: 0 }
    // This allows the frontend to read user.balances.EUR directly.
    toJSON: { virtuals: true, flattenMaps: true },
    toObject: { virtuals: true, flattenMaps: true },
  }
);

// ── Password Hashing Hook ──
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Referral Code Generation Hook ──
userSchema.pre('save', async function (next) {
  if (this.isNew && !this.referralCode) {
    let isUnique = false;
    while (!isUnique) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      const existing = await this.constructor.findOne({ referralCode: code });
      if (!existing) {
        this.referralCode = code;
        isUnique = true;
      }
    }
  }
  next();
});

// ── Instance Method: Compare Password ──
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
