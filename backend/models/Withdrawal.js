// backend/models/Withdrawal.js
const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true, // faster queries
    },

    btcAddress: {
      type: String,
      required: [true, 'Bitcoin address is required'],
      trim: true,
      validate: {
        validator: function (v) {
          // Basic BTC address validation (legacy + SegWit + Taproot)
          return /^(1|3|bc1q|bc1p)[a-zA-Z0-9]{25,39}$/.test(v);
        },
        message: 'Invalid Bitcoin address format',
      },
    },

    amount: {
      type: Number,
      required: [true, 'Withdrawal amount is required'],
      min: [0.0001, 'Minimum withdrawal amount is 0.0001 BTC'],
    },

    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'sent', 'failed'],
      default: 'pending',
      index: true,
    },

    txHash: {
      type: String,
      trim: true,
      sparse: true, // allow null/undefined
    },

    adminNote: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    // Optional: store fiat equivalent at time of request
    fiatEquivalent: {
      type: Number,
      min: 0,
    },

    // Optional: fee deducted
    fee: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Optional: net amount sent (amount - fee)
    netAmount: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: formatted createdAt
withdrawalSchema.virtual('formattedCreatedAt').get(function () {
  return this.createdAt.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
});

// Pre-save hook: calculate netAmount if fee is set
withdrawalSchema.pre('save', function (next) {
  if (this.fee !== undefined && this.amount !== undefined) {
    this.netAmount = this.amount - this.fee;
  }
  next();
});

// Index for faster queries
withdrawalSchema.index({ user: 1, status: 1 });
withdrawalSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Withdrawal', withdrawalSchema);
