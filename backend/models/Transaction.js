// backend/models/Transaction.js

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
        'yield'
      ],
      required: true,
      lowercase: true,
      index: true
    },

    amount: {
      type: Number,
      required: true,
      min: [0, 'Amount cannot be negative']
    },

    signedAmount: {
      type: Number
    },

    fee: {
      type: Number,
      default: 0,
      min: [0, 'Fee cannot be negative']
    },

    netAmount: {
      type: Number,
      min: [0, 'Net amount cannot be negative']
    },

    currency: {
      type: String,
      default: 'EUR',
      uppercase: true,
      trim: true,
      minlength: 3,
      maxlength: 5,
      required: true
    },

    walletAddress: {
      type: String,
      trim: true,
      sparse: true
    },

    // Prevent duplicate deposits
    txHash: {
      type: String,
      trim: true,
      sparse: true,
      unique: true
    },

    /**
     * ✅ CLEAN STATUS SYSTEM (ADMIN CONTROL READY)
     */
    status: {
      type: String,
      enum: [
        'pending',     // waiting for admin
        'approved',    // admin approved
        'processing',  // payout in progress
        'completed',   // finished successfully
        'rejected',    // rejected by admin
        'failed'       // failed after processing
      ],
      default: 'pending',
      index: true
    },

    description: {
      type: String,
      trim: true,
      maxlength: 200
    },

    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      sparse: true
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed
    },

    method: {
      type: String,
      enum: ['crypto', 'bank', 'internal', 'card'],
      default: 'crypto'
    },

    /**
     * 🔐 ADMIN CONTROL FIELDS
     */
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },

    reviewedAt: {
      type: Date
    },

    rejectionReason: {
      type: String,
      trim: true,
      maxlength: 300
    }

  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

/**
 * ✅ PRE-VALIDATION:
 * Ensures signedAmount + netAmount are always correct
 */
transactionSchema.pre('validate', function (next) {
  this.netAmount = this.amount - (this.fee || 0);

  const negativeTypes = ['withdrawal', 'investment'];

  this.signedAmount = negativeTypes.includes(this.type)
    ? -Math.abs(this.netAmount)
    : Math.abs(this.netAmount);

  next();
});

/**
 * ✅ STATUS NORMALIZATION (BACKWARD COMPATIBILITY)
 * Converts old statuses → new system
 */
transactionSchema.pre('save', function (next) {
  const map = {
    success: 'completed',
    confirmed: 'completed'
  };

  if (map[this.status]) {
    this.status = map[this.status];
  }

  next();
});

/**
 * ✅ HELPER METHODS
 */
transactionSchema.methods.isPending = function () {
  return this.status === 'pending';
};

transactionSchema.methods.isApproved = function () {
  return this.status === 'approved';
};

transactionSchema.methods.isCompleted = function () {
  return this.status === 'completed';
};

/**
 * ✅ INDEXES (PERFORMANCE OPTIMIZED)
 */
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ status: 1, createdAt: -1 });
transactionSchema.index({ type: 1, status: 1 });

/**
 * ✅ VIRTUAL: FORMATTED AMOUNT
 */
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
