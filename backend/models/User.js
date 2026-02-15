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
  // 🛠️ SYSTEM FIELD: Distinguishes the BTC Counter doc from actual users
  isCounter: { type: Boolean, default: false, select: false },

  // Fields are only required if this IS NOT a counter document
  fullName: { type: String, required: function() { return !this.isCounter; }, trim: true },
  email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  password: { type: String, required: function() { return !this.isCounter; }, select: false },
  
  phone: { type: String, default: '', trim: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isAdmin: { type: Boolean, default: false },

  // 📈 ROI INVESTMENT TRACKING
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

  // ₿ BITCOIN WALLET LOGIC
  btcIndex: { type: Number, default: 0 },
  btcIndexCounter: { type: Number, default: 0 }, // Stores the global index in the counter doc
  btcAddress: { type: String },
  
  ledger: [ledgerSchema],
  isActive: { type: Boolean, default: true },
  banned: { type: Boolean, default: false },

  resetOtp: { type: String, select: false },
  resetOtpExpires: { type: Date, select: false }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

/**
 * ⚡ PRE-SAVE: HASHING & PLAN SYNC
 */
userSchema.pre('save', async function (next) {
  // 1. Skip logic for the system counter document
  if (this.isCounter) return next();

  // 2. Handle Password Hashing
  if (this.isModified('password')) {
    // Only hash if it's not already a bcrypt hash
    if (!this.password.startsWith('$2b$')) {
      const salt = await bcrypt.genSalt(12);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  // 3. Handle Plan Logic
  if (this.isModified('plan') || this.isModified('investedAmount')) {
    const planInfo = PLAN_DATA ? PLAN_DATA[this.plan] : null;
    if (planInfo) {
      this.dailyRoiRate = planInfo.dailyROI || 0;
      this.planDuration = planInfo.duration || 30;
      this.isPlanActive = this.investedAmount >= planInfo.min;
    } else {
      this.dailyRoiRate = 0;
      this.isPlanActive = false;
    }
  }

  // 4. Sync Admin Role
  this.isAdmin = this.role === 'admin';

  next();
});

/**
 * 🔑 METHOD: COMPARE PASSWORD
 * Used by the login route
 */
userSchema.methods.comparePassword = async function (enteredPassword) {
  // This works even if password wasn't selected in the initial query
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

// Export the model, ensuring we don't overwrite if it exists
export default mongoose.models.User || mongoose.model('User', userSchema);

