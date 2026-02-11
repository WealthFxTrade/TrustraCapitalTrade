import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { PLAN_DATA } from '../config/plans.js'; // Ensure path is correct

const ledgerSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  currency: { type: String, default: 'EUR' },
  type: {
    type: String,
    enum: ['deposit', 'withdrawal', 'investment', 'roi_profit', 'bonus'],
    required: true
  },
  status: { type: String, enum: ['pending', 'completed', 'failed', 'cancelled'], default: 'pending' },
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
  plan: { type: String, default: 'none' }, // Store keys like 'rioStarter', 'rioBasic'
  isPlanActive: { type: Boolean, default: false },
  investedAmount: { type: Number, default: 0 },
  dailyRoiRate: { type: Number, default: 0 }, // Automatically synced from PLAN_DATA
  lastProfitDate: { type: Date },

  balances: {
    type: Map,
    of: Number,
    default: () => new Map([['BTC', 0], ['EUR', 0], ['USDT', 0]])
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
 * ⚡ AUTO-SYNC PLAN DATA
 * Sets dailyRoiRate based on the selected Rio plan key
 */
userSchema.pre('save', async function (next) {
  // 1. Handle Password Hashing
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  }

  // 2. Handle Rio Plan Logic
  if (this.isModified('plan')) {
    const planInfo = PLAN_DATA[this.plan];
    if (planInfo) {
      this.dailyRoiRate = planInfo.dailyROI;
      this.isPlanActive = this.investedAmount >= planInfo.min;
    } else if (this.plan === 'none') {
      this.dailyRoiRate = 0;
      this.isPlanActive = false;
    }
  }

  next();
});

userSchema.methods.comparePassword = async function (p) {
  return bcrypt.compare(p, this.password);
};

export default mongoose.models.User || mongoose.model('User', userSchema);

