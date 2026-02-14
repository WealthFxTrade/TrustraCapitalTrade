import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { PLAN_DATA } from '../config/plans.js';

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

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false }, 
  phone: { type: String, default: '', trim: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isAdmin: { type: Boolean, default: false },

  // 📈 RIO INVESTMENT TRACKING
  plan: { type: String, default: 'none' },
  isPlanActive: { type: Boolean, default: false },
  investedAmount: { type: Number, default: 0 },
  dailyRoiRate: { type: Number, default: 0 },
  lastProfitDate: { type: Date },

  planDaysServed: { type: Number, default: 0 },
  planDuration: { type: Number, default: 30 },

  balances: {
    type: Map,
    of: Number,
    default: () => new Map([
      ['BTC', 0],
      ['EUR', 0],
      ['EUR_PROFIT', 0], 
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
  // 1. Handle Password Hashing (Only hash if modified and not already a hash)
  if (this.isModified('password')) {
    // Basic check to see if it's already a bcrypt hash (starts with $2)
    if (!this.password.startsWith('$2')) {
      const salt = await bcrypt.genSalt(12);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  // 2. Handle Rio Plan Logic
  if (this.isModified('plan') || this.isModified('investedAmount')) {
    const planInfo = PLAN_DATA ? PLAN_DATA[this.plan] : null;

    if (planInfo) {
      this.dailyRoiRate = planInfo.dailyROI || 0;
      this.planDuration = planInfo.duration || 30;
      // Plan activates only if invested amount meets the minimum
      this.isPlanActive = this.investedAmount >= planInfo.min;
    } else {
      this.dailyRoiRate = 0;
      this.isPlanActive = false;
      // We don't reset investedAmount here in case user is just switching plans
    }
  }

  // 3. Sync Admin Role and Boolean
  if (this.role === 'admin') {
    this.isAdmin = true;
  } else {
    this.isAdmin = false;
  }

  next();
});

/**
 * 🔑 PASSWORD VERIFICATION
 */
userSchema.methods.comparePassword = async function (enteredPassword) {
  // Safe comparison even if password field is not selected
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.models.User || mongoose.model('User', userSchema);
