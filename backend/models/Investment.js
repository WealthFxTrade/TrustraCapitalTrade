// models/Investment.js - Audit Certified v8.4.1
import mongoose from 'mongoose';

const investmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Investment must belong to an active user node'],
      index: true,
    },

    // Maps to Landing.jsx keys: 'starter', 'basic', 'standard', 'advanced', 'elite'
    planKey: {
      type: String,
      required: [true, 'Tier key is mandatory'],
      trim: true,
      lowercase: true,
      index: true,
    },

    planName: {
      type: String,
      required: [true, 'Plan identifier is required'],
      trim: true,
    },

    amount: {
      type: Number,
      required: [true, 'Capital injection amount is required'],
      min: [100, 'Minimum capital requirement is €100'], // Synced with Rio Starter
    },

    currency: {
      type: String,
      enum: ['EUR', 'BTC', 'USDT'],
      default: 'EUR',
      uppercase: true,
    },

    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled', 'paused'],
      default: 'active',
      index: true,
    },

    durationDays: {
      type: Number,
      required: [true, 'Lifecycle duration is required'],
      min: [30, 'Minimum node cycle is 30 days'], 
    },

    endsAt: {
      type: Date,
      index: true,
    },

    // Realized yield from external trading activity
    totalReturn: {
      type: Number,
      default: 0,
      min: [0, 'Yield cannot be negative'],
    },

    lastReturnUpdate: {
      type: Date,
      default: null,
    },

    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
      sparse: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── MIDDLEWARE ──

investmentSchema.pre('save', function (next) {
  // Auto-calculate end date for new investments
  if (this.isNew && !this.endsAt) {
    const start = this.createdAt || new Date();
    this.endsAt = new Date(start.getTime() + this.durationDays * 24 * 60 * 60 * 1000);
  }
  next();
});

// ── VIRTUALS ──

/**
 * ROI Percentage: (Total Return / Principal) * 100
 */
investmentSchema.virtual('roiPercentage').get(function () {
  if (!this.amount || this.amount === 0) return 0;
  return ((this.totalReturn / this.amount) * 100).toFixed(2);
});

/**
 * Cycle Progress: Percentage of time elapsed
 */
investmentSchema.virtual('progress').get(function () {
  if (!this.endsAt || !this.createdAt) return 0;
  const total = this.endsAt - this.createdAt;
  const elapsed = Math.min(Date.now() - this.createdAt, total);
  return Math.min(100, Math.round((elapsed / total) * 100));
});

// ── STATICS ──

investmentSchema.statics.getUserActive = function (userId) {
  return this.find({ user: userId, status: 'active' }).sort({ createdAt: -1 });
};

const Investment = mongoose.model('Investment', investmentSchema);
export default Investment;

