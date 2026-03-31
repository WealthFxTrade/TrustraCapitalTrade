// models/Transaction.js
import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Transaction must belong to a user'],
      index: true,
    },
    type: {
      type: String,
      enum: ['deposit', 'withdrawal', 'investment', 'profit', 'reinvest', 'bonus', 'roi'],
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
      required: true,
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
      maxlength: [200, 'Description is too long'],
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

// Pre-validate middleware
transactionSchema.pre('validate', function (next) {
  this.netAmount = this.amount - (this.fee || 0);

  if (this.signedAmount == null) {
    const isNegativeType = ['withdrawal', 'investment'].includes(this.type);
    this.signedAmount = isNegativeType 
      ? -Math.abs(this.netAmount) 
      : Math.abs(this.netAmount);
  }

  if (this.netAmount < 0) {
    this.invalidate('netAmount', 'Net amount cannot be negative after fees');
  }

  next();
});

// Indexes
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ status: 1, createdAt: -1 });
transactionSchema.index({ type: 1, status: 1 });

// Virtual for Euro display
transactionSchema.virtual('formattedAmount').get(function () {
  const sign = this.signedAmount >= 0 ? '+' : '';
  return `\( {sign}€ \){Math.abs(this.netAmount).toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
});

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
