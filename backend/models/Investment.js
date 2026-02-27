// models/Investment.js
import mongoose from 'mongoose';

/**
 * Investment Schema
 * Tracks user investments in a plan or product.
 * No automatic ROI or profit crediting — real yield must come from external sources.
 */
const investmentSchema = new mongoose.Schema(
  {
    // Owner of the investment
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Investment must belong to a user'],
      index: true,
    },

    // Plan or product identifier (e.g., 'starter', 'basic')
    planKey: {
      type: String,
      required: [true, 'Plan key is required'],
      trim: true,
      lowercase: true,
      index: true,
    },

    // Human-readable plan name (for display only)
    planName: {
      type: String,
      required: [true, 'Plan name is required'],
      trim: true,
    },

    // Invested amount (positive)
    amount: {
      type: Number,
      required: [true, 'Investment amount is required'],
      min: [50, 'Minimum investment amount is 50'],
    },

    // Currency of investment
    currency: {
      type: String,
      enum: ['EUR', 'BTC', 'USDT'],
      default: 'EUR',
      uppercase: true,
      trim: true,
    },

    // Current status of the investment
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled', 'paused'],
      default: 'active',
      index: true,
    },

    // Planned or actual duration in days
    durationDays: {
      type: Number,
      required: [true, 'Duration in days is required'],
      min: [1, 'Duration must be at least 1 day'],
    },

    // Planned end date (calculated as createdAt + durationDays)
    endsAt: {
      type: Date,
      required: [true, 'End date is required'],
    },

    // Accumulated return (from real external sources only — NEVER auto-calculated)
    totalReturn: {
      type: Number,
      default: 0,
      min: [0, 'Total return cannot be negative'],
    },

    // Last time return was updated (for audit/reference only)
    lastReturnUpdate: {
      type: Date,
      default: null,
    },

    // Optional: Reference to related transaction or deposit
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
      sparse: true,
    },

    // Admin who last reviewed/updated
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/**
 * Pre-save hook: Validate and auto-calculate endsAt if missing
 */
investmentSchema.pre('save', function (next) {
  if (this.isNew && !this.endsAt) {
    const start = this.createdAt || new Date();
    this.endsAt = new Date(start.getTime() + this.durationDays * 24 * 60 * 60 * 1000);
  }

  // Safety: endsAt must be in the future
  if (this.endsAt <= new Date()) {
    this.invalidate('endsAt', 'End date must be in the future');
  }

  next();
});

/**
 * Virtual: Progress percentage (0–100) — for display only
 */
investmentSchema.virtual('progress').get(function () {
  if (!this.endsAt || !this.createdAt) return 0;

  const totalMs = this.endsAt - this.createdAt;
  const elapsedMs = Math.min(Date.now() - this.createdAt, totalMs);

  return Math.min(100, Math.round((elapsedMs / totalMs) * 100));
});

/**
 * Virtual: Days remaining (for UI)
 */
investmentSchema.virtual('daysRemaining').get(function () {
  if (!this.endsAt) return 0;
  const remainingMs = this.endsAt - Date.now();
  return Math.max(0, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)));
});

/**
 * Indexes for performance
 */
investmentSchema.index({ user: 1, status: 1 });
investmentSchema.index({ status: 1, endsAt: 1 });
investmentSchema.index({ planKey: 1, createdAt: -1 });

/**
 * Static method: Get active investments for a user
 */
investmentSchema.statics.getUserActive = async function (userId) {
  return this.find({
    user: userId,
    status: 'active',
  }).sort({ createdAt: -1 });
};

/**
 * Static method: Get all active investments (for admin/cron review)
 */
investmentSchema.statics.getAllActive = async function (limit = 100) {
  return this.find({ status: 'active' })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('user', 'email fullName');
};

export default mongoose.model('Investment', investmentSchema);
