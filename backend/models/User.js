import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { PLAN_DATA } from '../config/plans.js';

const btcDepositSchema = new mongoose.Schema({
  txid: String,
  vout: Number,
  amountSats: Number,
  amountBtc: Number,
  amountEur: Number,
  blockHeight: Number,
  status: { type: String, default: 'credited' },
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
  status: { type: String, enum: ['pending', 'completed', 'failed', 'cancelled'], default: 'completed' },
  description: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  isCounter: { type: Boolean, default: false, select: false },
  fullName: { type: String, required: function() { return !this.isCounter; }, trim: true },
  email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  password: { type: String, required: function() { return !this.isCounter; }, select: false },
  phone: { type: String, trim: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isAdmin: { type: Boolean, default: false },

  // ROI & Balances
  plan: { type: String, default: 'none' },
  investedAmount: { type: Number, default: 0 },
  dailyRoiRate: { type: Number, default: 0 },
  planDaysServed: { type: Number, default: 0 },
  planDuration: { type: Number, default: 30 },
  lastProfitDate: { type: Date },

  balances: {
    type: Map,
    of: Number,
    default: () => new Map([['BTC', 0], ['EUR', 0], ['EUR_PROFIT', 0], ['USDT', 0]])
  },

  // ₿ BITCOIN & WALLET LOGIC
  btcAddress: { type: String }, // Legacy field for easy access
  
  // ✅ SYNCED WITH walletService.js: Stores derived BTC/ETH/USDT addresses
  depositAddresses: {
    type: Map,
    of: String,
    default: () => new Map()
  },

  btcDeposits: [btcDepositSchema], 
  ledger: [ledgerSchema],

  isActive: { type: Boolean, default: true },
  banned: { type: Boolean, default: false }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

/**
 * ⚡ PRE-SAVE: HASHING & PLAN SYNC
 */
userSchema.pre('save', async function (next) {
  if (this.isCounter) return next();

  // 1. Password Hashing
  if (this.isModified('password')) {
    if (!this.password.startsWith('$2b$')) {
      const salt = await bcrypt.genSalt(12);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  // 2. Plan ROI Sync
  if (this.isModified('plan') || this.isModified('investedAmount')) {
    const planInfo = PLAN_DATA ? PLAN_DATA[this.plan] : null;
    if (planInfo) {
      this.dailyRoiRate = planInfo.dailyROI / 100 || 0; // Store as decimal for cron
      this.planDuration = planInfo.duration || 30;
    }
  }

  this.isAdmin = this.role === 'admin';
  next();
});

/**
 * 🔑 METHOD: COMPARE PASSWORD
 */
userSchema.methods.comparePassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.models.User || mongoose.model('User', userSchema);

