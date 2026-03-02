import mongoose from 'mongoose';

/**
 * Transaction Schema v8.4.4
 * Optimized for Elite Yield Protocol & Secure Handshake
 */
const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Transaction must belong to a user node'],
      index: true,
    },
    type: {
      type: String,
      enum: ['deposit', 'withdrawal', 'investment', 'profit', 'reinvest'],
      required: [true, 'Transaction type is required'],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    signedAmount: {
      type: Number,
      required: true,
    },
    fee: {
      type: Number,
      default: 0,
      min: [0, 'Fee cannot be negative'],
    },
    netAmount: {
      type: Number,
      min: [0, 'Net amount cannot be negative'],
    },
    currency: {
      type: String,
      default: 'EUR',
      uppercase: true,
      trim: true,
      minlength: 3,
      maxlength: 3,
    },
    walletAddress: {
      type: String,
      trim: true,
      sparse: true,
    },
    txHash: {
      type: String,
      trim: true,
      sparse: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'rejected', 'failed'],
      default: 'pending',
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description too long'],
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      sparse: true,
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    method: {
      type: String,
      enum: ['crypto', 'bank', 'internal', 'card'],
      default: 'crypto',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/**
 * ── PRE-VALIDATE HANDSHAKE ──
 * Ensures accounting direction and net amounts are correct
 */
transactionSchema.pre('validate', function (next) {
  // 1. Calculate net yield/allocation after protocol fees
  this.netAmount = this.amount - (this.fee || 0);

  // 2. Auto-calculate signedAmount for Ledger (negative for egress)
  if (this.signedAmount == null) {
    const isNegative = ['withdrawal', 'investment'].includes(this.type);
    this.signedAmount = isNegative ? -Math.abs(this.netAmount) : Math.abs(this.netAmount);
  }

  // 3. Prevent mathematical overflow
  if (this.netAmount < 0) {
    this.invalidate('netAmount', 'Net allocation cannot be negative after fees');
  }

  next();
});

/**
 * ── SYSTEM INDEXES ──
 */
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ status: 1, createdAt: -1 });

/**
 * ── VIRTUALS ──
 * Formatted string for Terminal UI
 */
transactionSchema.virtual('formattedAmount').get(function () {
  const sign = this.signedAmount >= 0 ? '+' : '-';
  return `${sign} ${Math.abs(this.netAmount).toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${this.currency}`;
});

/**
 * ── STATIC PROTOCOLS ──
 */
transactionSchema.statics.getPendingWithdrawals = async function (limit = 50) {
  return this.find({ type: 'withdrawal', status: 'pending' })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('user', 'email fullName');
};

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;

