// backend/models/Transaction.js
import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true, // faster queries by user
    },

    type: {
      type: String,
      required: [true, 'Transaction type is required'],
      enum: ['deposit', 'withdrawal', 'profit', 'bonus', 'referral', 'admin_adjustment', 'kyc_reward'],
      index: true,
    },

    amount: {
      type: Number,
      required: [true, 'Amount is required'],
    },

    // Signed amount — positive for incoming, negative for outgoing
    signedAmount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled', 'reversed'],
      default: 'completed',
      index: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description too long'],
    },

    reference: {
      type: String,
      trim: true,
      sparse: true,
      index: { unique: true, sparse: true }, // optional unique reference
    },

    paymentMethod: {
      type: String,
      enum: ['bank_transfer', 'crypto', 'wallet', 'manual', 'system'],
      default: 'manual',
    },

    // Optional fields for crypto / external payments
    txHash: {
      type: String,
      trim: true,
      sparse: true,
    },

    // For admin actions or reversals
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      sparse: true,
    },

    // Flexible field for extra metadata (proof URL, tx ID, note, etc.)
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: formatted date for frontend
transactionSchema.virtual('formattedDate').get(function () {
  return this.createdAt.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
});

// Pre-save hook: automatically set signedAmount based on type
transactionSchema.pre('save', function (next) {
  if (this.isNew) {
    const incoming = ['deposit', 'profit', 'bonus', 'referral', 'kyc_reward'].includes(this.type);
    this.signedAmount = incoming ? Math.abs(this.amount) : -Math.abs(this.amount);
  }
  next();
});

// Compound indexes for common queries (dashboard, history)
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ user: 1, type: 1 });
transactionSchema.index({ user: 1, status: 1 });

export default mongoose.model('Transaction', transactionSchema);
