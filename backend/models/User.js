import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { PLAN_DATA } from '../config/plans.js';

// ──────────────────────────────────────────────
// SUB-SCHEMAS
// ──────────────────────────────────────────────

const btcDepositSchema = new mongoose.Schema({
  txid: { type: String, required: true },
  vout: { type: Number, default: 0 },
  amountSats: { type: Number, required: true },
  amountBtc: { type: Number, required: true },
  amountEur: { type: Number, default: 0 },
  blockHeight: { type: Number },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'credited', 'failed'],
    default: 'credited'
  },
  creditedAt: { type: Date, default: Date.now }
});

const ledgerSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  currency: { type: String, default: 'EUR' },
  type: {
    type: String,
    enum: ['deposit', 'withdrawal', 'investment', 'profit', 'roi_profit', 'bonus', 'exchange'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'completed'
  },
  description: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

// ──────────────────────────────────────────────
// USER SCHEMA
// ──────────────────────────────────────────────

const userSchema = new mongoose.Schema({
  isCounter: { type: Boolean, default: false, select: false },

  fullName: {
    type: String,
    required: function () { return !this.isCounter; },
    trim: true
  },

  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
    validate: {
      validator(v) {
        if (!v) return true;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Invalid email format'
    },
    // Convert empty strings / null → undefined so sparse index works correctly
    set: (v) => (v && v.trim() !== '' ? v.trim().toLowerCase() : undefined)
  },

  password: {
    type: String,
    required: function () { return !this.isCounter; },
    select: false
  },

  phone: { type: String, trim: true },

  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },

  // ──── ROI & Plan ────
  plan: { type: String, default: 'none' },
  investedAmount: { type: Number, default: 0 },
  dailyRoiRate: { type: Number, default: 0 },
  planDaysServed: { type: Number, default: 0 },
  planDuration: { type: Number, default: 0 },
  lastProfitDate: { type: Date },

  // ──── Balances (plain sub-doc, auto change-tracking) ────
  balances: {
    BTC: { type: Number, default: 0 },
    EUR: { type: Number, default: 0 },
    EUR_PROFIT: { type: Number, default: 0 },
    USDT: { type: Number, default: 0 }
  },

  // ──── Wallet / Deposit Addresses ────
  btcAddress: { type: String, sparse: true },

  depositAddresses: {
    type: Map,
    of: String,
    default: () => new Map()
  },

  // ──── Embedded Tx History (capped for safety) ────
  btcDeposits: {
    type: [btcDepositSchema],
    default: [],
    validate: {
      validator(arr) { return arr.length <= 500; },
      message: 'btcDeposits exceeded 500 entries — archive old records'
    }
  },

  ledger: {
    type: [ledgerSchema],
    default: [],
    validate: {
      validator(arr) { return arr.length <= 2000; },
      message: 'Ledger exceeded 2000 entries — archive old records'
    }
  },

  isActive: { type: Boolean, default: true },
  banned: { type: Boolean, default: false }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ──────────────────────────────────────────────
// VIRTUALS
// ──────────────────────────────────────────────

/**
 * Derived from `role` — single source of truth, no desync risk.
 */
userSchema.virtual('isAdmin').get(function () {
  return this.role === 'admin';
});

// ──────────────────────────────────────────────
// INDEXES
// ──────────────────────────────────────────────

userSchema.index({ role: 1 });
userSchema.index({ plan: 1, isActive: 1 });
userSchema.index({ btcAddress: 1 }, { sparse: true });
userSchema.index({ 'btcDeposits.txid': 1 });

// ──────────────────────────────────────────────
// PRE-SAVE HOOK
// ──────────────────────────────────────────────

userSchema.pre('save', async function (next) {
  try {
    if (this.isCounter) return next();

    // 1️⃣  Password hashing (robust prefix detection)
    if (this.isModified('password') && this.password) {
      const isAlreadyHashed = /^\$2[aby]\$\d{2}\$/.test(this.password);
      if (!isAlreadyHashed) {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
      }
    }

    // 2️⃣  Plan ↔ ROI sync (resets cleanly when plan is removed / unknown)
    if (this.isModified('plan') || this.isModified('investedAmount')) {
      const planInfo =
