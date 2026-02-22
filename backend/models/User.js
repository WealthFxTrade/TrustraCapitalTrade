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
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isAdmin: { type: Boolean, default: false },

  // ROI & Balances
  plan: { type: String, default: 'none' },
  investedAmount: { type: Number, default: 0 },
  balances: {
    type: Map,
    of: Number,
    default: () => new Map([['BTC', 0], ['EUR', 0], ['EUR_PROFIT', 0], ['USDT', 0]])
  },

  // BTC Logic
  btcAddress: { type: String },
  btcDeposits: [btcDepositSchema], // ✅ Matches the Watcher's Object structure
  ledger: [ledgerSchema],
  
  isActive: { type: Boolean, default: true },
  banned: { type: Boolean, default: false }
}, { timestamps: true });

// ... (Keep your pre-save and comparePassword methods from before) ...

export default mongoose.models.User || mongoose.model('User', userSchema);
