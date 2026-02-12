import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
// ✅ Note: Ensure this file exports an object where keys match your user.plan strings
import { PLAN_DATA } from '../config/plans.js'; 

const ledgerSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  currency: { type: String, default: 'EUR' },
  type: {
    type: String,
    // ✅ ADDED: 'profit' and 'exchange' for the 2026 wallet logic
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

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  phone: { type: String, default: '', trim: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },

  // 📈 RIO INVESTMENT TRACKING
  plan: { type: String, default: 'none' }, 
  isPlanActive: { type: Boolean, default: false },
  investedAmount: { type: Number, default: 0 },
  dailyRoiRate: { type: Number, default: 0 }, 
  lastProfitDate: { type: Date },
  
  // ✅ NEW: Track plan duration to auto-stop cron jobs
  planDaysServed: { type: Number, default: 0 },
  planDuration: { type: Number, default: 30 },

  balances: {
    type: Map,
    of: Number,
    // ✅ FIXED: Added EUR_PROFIT to the default map
    default: () => new Map([
      ['BTC', 0], 
      ['EUR', 0], 
      ['EUR_PROFIT', 0], // The "Profit Wallet"
      ['USDT', 0]
    ])
  },
  btcIndex: { type: Number, default: 0 },
  btcAddress: { type: String },
  ledger: [ledgerSchema],
  isActive: { type: Boolean, default: true },
  banned: { type: Boolean, default: false },

  resetPasswordToken: { type: String, select: false },
  resetPasswordExpires: { type: Date, select: false },
  resetOtp: { type: String, select: false },
  resetOtpExpires: { type: Date, select: false }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

/**
 * ⚡ AUTO-SYNC PLAN DATA & PASSWORD HASHING
 */
userSchema.pre('save', async function (next) {
  // 1. Handle Password Hashing
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  }

  // 2. Handle Rio Plan Logic
  if (this.isModified('plan') || this.isModified('investedAmount')) {
    const planInfo = PLAN_DATA[this.plan];
    if (planInfo) {
      this.dailyRoiRate = planInfo.dailyROI;
      this.planDuration = planInfo.duration || 30;
      // Plan activates only if invested amount meets the minimum
      this.isPlanActive = this.investedAmount >= planInfo.min;
    } else if (this.plan === 'none') {
      this.dailyRoiRate = 0;
      this.isPlanActive = false;
      this.investedAmount = 0;
    }
  }

  next();
});

userSchema.methods.comparePassword = async function (p) {
  return bcrypt.compare(p, this.password);
};

export default mongoose.models.User || mongoose.model('User', userSchema);

