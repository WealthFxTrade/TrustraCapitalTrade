// models/Investment.js - Fintech Standard Ledger v9.0
import mongoose from 'mongoose';
import Transaction from './Transaction.js';

const investmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    planKey: { type: String, required: true, trim: true, lowercase: true, index: true },
    planName: { type: String, required: true, trim: true },

    amount: { type: Number, required: true, min: [100, 'Minimum investment €100'] },
    currency: { type: String, enum: ['EUR', 'BTC', 'USDT'], default: 'EUR', uppercase: true },

    status: { type: String, enum: ['active', 'completed', 'cancelled', 'paused'], default: 'active', index: true },

    durationDays: { type: Number, required: true, min: [30, 'Minimum cycle 30 days'] },
    endsAt: { type: Date, index: true },

    totalReturn: { type: Number, default: 0, min: 0 },
    lastReturnUpdate: { type: Date, default: null },

    referenceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', sparse: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// ── MIDDLEWARE ──
investmentSchema.pre('save', function (next) {
  // Auto-calculate end date if not set
  if (this.isNew && !this.endsAt) {
    const start = this.createdAt || new Date();
    this.endsAt = new Date(start.getTime() + this.durationDays * 24 * 60 * 60 * 1000);
  }
  next();
});

// ── VIRTUALS ──

// ROI Percentage = totalReturn / amount
investmentSchema.virtual('roiPercentage').get(function () {
  if (!this.amount || this.amount === 0) return 0;
  return ((this.totalReturn / this.amount) * 100).toFixed(2);
});

// Cycle progress = % time elapsed
investmentSchema.virtual('progress').get(function () {
  if (!this.endsAt || !this.createdAt) return 0;
  const total = this.endsAt - this.createdAt;
  const elapsed = Math.min(Date.now() - this.createdAt, total);
  return Math.min(100, Math.round((elapsed / total) * 100));
});

// ── STATICS ──

/**
 * Fetch all active investments for a user
 */
investmentSchema.statics.getUserActive = function (userId) {
  return this.find({ user: userId, status: 'active' }).sort({ createdAt: -1 });
};

/**
 * Update investment returns and sync with user's balances
 */
investmentSchema.methods.updateReturns = async function (newReturn) {
  this.totalReturn = newReturn;
  this.lastReturnUpdate = new Date();
  await this.save();

  // Update User balances: EUR + ROI
  const User = mongoose.model('User');
  const user = await User.findById(this.user);

  if (!user) throw new Error('User not found for investment sync');

  const currentInvested = user.balances.get('INVESTED') || 0;
  const currentROI = user.balances.get('ROI') || 0;

  // Ledger-consistent: reinvested or realized yield goes to ROI
  const unrealizedYield = this.totalReturn - currentROI;
  if (unrealizedYield > 0) {
    user.balances.set('ROI', currentROI + unrealizedYield);
    user.balances.set('INVESTED', currentInvested); // invested principal unchanged
    user.markModified('balances');
    await user.save();

    // Create transaction log for yield update
    await Transaction.create({
      user: user._id,
      type: 'roi',
      amount: unrealizedYield,
      signedAmount: Math.abs(unrealizedYield),
      currency: this.currency,
      status: 'completed',
      description: `Yield update for plan ${this.planName}`,
    });
  }
};

const Investment = mongoose.model('Investment', investmentSchema);
export default Investment;
