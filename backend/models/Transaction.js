// models/Transaction.js
import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: [
        'deposit',
        'withdrawal',
        'investment',
        'profit',
        'reinvest',
        'compound',
        'bonus',
        'roi',
        'yield' // --- ADDED TO PREVENT RIO ENGINE CRASH ---
      ],
      required: true,
      index: true,
      lowercase: true // Ensures 'Yield' from frontend matches 'yield' in DB
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Amount cannot be negative']
    },
    signedAmount: { type: Number },
    fee: { type: Number, default: 0, min: [0, 'Fee cannot be negative'] },
    netAmount: { type: Number, min: [0, 'Net amount cannot be negative'] },
    currency: {
      type: String,
      default: 'EUR',
      uppercase: true,
      trim: true,
      minlength: 3,
      maxlength: 5,
      required: true
    },
    walletAddress: { type: String, trim: true, sparse: true },
    txHash: { type: String, trim: true, sparse: true, index: true },
    status: {
      type: String,
      enum: ['pending', 'completed', 'rejected', 'failed', 'confirmed', 'success'],
      default: 'pending',
      index: true
    },
    description: { type: String, trim: true, maxlength: 200 },
    referenceId: { type: mongoose.Schema.Types.ObjectId, sparse: true },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    method: {
      type: String,
      enum: ['crypto', 'bank', 'internal', 'card'],
      default: 'crypto'
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

/**
 * Pre-validation Logic:
 * Ensures signedAmount correctly reflects the impact on the user's principal.
 */
transactionSchema.pre('validate', function (next) {
  this.netAmount = this.amount - (this.fee || 0);

  // Define which types are "Outflow"
  const negativeTypes = ['withdrawal', 'investment'];
  
  this.signedAmount = negativeTypes.includes(this.type)
    ? -Math.abs(this.netAmount)
    : Math.abs(this.netAmount);

  if (this.netAmount < 0) {
    this.invalidate('netAmount', 'Net amount cannot be negative');
  }

  next();
});

// Optimized Performance Indexes
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ status: 1, createdAt: -1 });
transactionSchema.index({ type: 1, status: 1 });

// Virtual for log formatting
transactionSchema.virtual('formattedAmount').get(function () {
  const sign = this.signedAmount >= 0 ? '+' : '-';
  const symbol = this.currency === 'EUR' ? '€' : this.currency;
  return `${sign}${symbol} ${Math.abs(this.netAmount).toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 8
  })}`;
});

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
