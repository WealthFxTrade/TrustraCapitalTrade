import mongoose from 'mongoose';

/**
 * Trustra Capital - Investment Schema (2026)
 * Handles capital locking, ROI accrual, and maturity tracking.
 */
const investmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  planName: {
    type: String,
    required: true,
    uppercase: true // e.g., 'TITAN', 'PLATINUM', 'NODE_ELITE'
  },
  amount: {
    type: Number,
    required: true,
    min: [50, 'Minimum investment is 50']
  },
  currency: {
    type: String,
    default: 'EUR',
    enum: ['EUR', 'BTC', 'USDT']
  },
  dailyRoi: {
    type: Number,
    required: true // Percentage, e.g., 1.5 for 1.5%
  },
  totalReturn: {
    type: Number,
    default: 0 // Accumulated profit
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active',
    index: true
  },
  durationDays: {
    type: Number,
    required: true
  },
  endsAt: {
    type: Date,
    required: true
  },
  lastRoiAt: {
    type: Date,
    default: Date.now // Last time profit was added
  }
}, { timestamps: true });

// Virtual: Check if plan is ready for maturity
investmentSchema.virtual('progress').get(function() {
  const total = this.endsAt - this.createdAt;
  const elapsed = Date.now() - this.createdAt;
  return Math.min(100, Math.round((elapsed / total) * 100));
});

const Investment = mongoose.models.Investment || mongoose.model('Investment', investmentSchema);
export default Investment;

