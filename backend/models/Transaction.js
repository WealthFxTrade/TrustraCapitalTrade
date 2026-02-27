// models/Transaction.js
import mongoose from 'mongoose';

/**
 * Transaction Schema
 * Represents deposits, withdrawals, investments, profits, and reinvestments.
 * All amounts are positive; use signedAmount for accounting direction.
 */
const transactionSchema = new mongoose.Schema(
  {
    // Owner of the transaction
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Transaction must belong to a user'],
      index: true,
    },

    // Transaction type
    type: {
      type: String,
      enum: ['deposit', 'withdrawal', 'investment', 'profit', 'reinvest'],
      required: [true, 'Transaction type is required'],
      index: true,
    },

    // Original requested/credited amount (always positive)
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },

    // Signed amount for accounting (+ deposits/profits, - withdrawals/investments)
    signedAmount: {
      type: Number,
      required: true,
    },

    // Optional fee deducted (positive number)
    fee: {
      type: Number,
      default: 0,
      min: [0, 'Fee cannot be negative'],
    },

    // Net amount after fee (to/from user)
    netAmount: {
      type: Number,
      min: [0, 'Net amount cannot be negative'],
    },

    // Currency (ISO 4217 code)
    currency: {
      type: String,
      default: 'EUR',
      uppercase: true,
      trim: true,
      minlength: [3, 'Currency must be 3 letters'],
      maxlength: [3, 'Currency must be 3 letters'],
    },

    // Destination wallet address (for withdrawals)
    walletAddress: {
      type: String,
      trim: true,
      sparse: true,
    },

    // Blockchain transaction hash (if applicable)
    txHash: {
      type: String,
      trim: true,
      sparse: true,
      index: true, // Single clean index (removed duplicate)
    },

    // Current status
    status: {
      type: String,
      enum: ['pending', 'completed', 'rejected', 'failed'],
      default: 'pending',
      index: true,
    },

    // Human-readable description
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description too long'],
    },

    // Reference to related document (Investment, Withdrawal, etc.)
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      sparse: true,
    },

    // Admin/user who last processed it
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // Payment/origin method
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
 * Pre-validate hook: Ensure consistent amounts
 */
transactionSchema.pre('validate', function (next) {
  // Calculate net amount after fee
  this.netAmount = this.amount - (this.fee || 0);

  // Auto-calculate signedAmount if missing
  if (this.signedAmount == null) {
    const isNegative = ['withdrawal', 'investment'].includes(this.type);
    this.signedAmount = isNegative ? -Math.abs(this.netAmount) : Math.abs(this.netAmount);
  }

  // Safety: netAmount must not be negative
  if (this.netAmount < 0) {
    this.invalidate('netAmount', 'Net amount cannot be negative after fee deduction');
  }

  next();
});

/**
 * Indexes for performance
 */
transactionSchema.index({ user: 1, createdAt: -1 });           // User timeline
transactionSchema.index({ status: 1, createdAt: -1 });         // Pending/completed queries
transactionSchema.index({ type: 1, createdAt: -1 });           // Type filtering
// txHash index already defined in field (removed duplicate schema.index)

/**
 * Virtual: Formatted display string
 */
transactionSchema.virtual('formattedAmount').get(function () {
  const sign = this.signedAmount >= 0 ? '+' : '-';
  return `\( {sign} \){Math.abs(this.netAmount).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${this.currency}`;
});

/**
 * Static method: Get all pending withdrawals (for admin queue)
 */
transactionSchema.statics.getPendingWithdrawals = async function (limit = 50) {
  return this.find({ type: 'withdrawal', status: 'pending' })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('user', 'email fullName')
    .populate('processedBy', 'email fullName');
};

/**
 * Static method: Get recent transactions for a user
 */
transactionSchema.statics.getUserRecent = async function (userId, limit = 20) {
  return this.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(limit);
};

export default mongoose.model('Transaction', transactionSchema);
