// backend/models/Withdrawal.js
import mongoose from 'mongoose';

const withdrawalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    // Added to support multi-asset logic from Dashboard
    asset: {
      type: String,
      enum: ['BTC', 'ETH', 'USDT'],
      required: [true, 'Asset type is required'],
      default: 'BTC'
    },
    // Renamed from btcAddress to be generic
    address: {
      type: String,
      required: [true, 'Destination address is required'],
      trim: true,
      validate: {
        validator: function(v) {
          // BTC: Legacy, Segwit, Taproot | ETH/USDT: 0x...
          const btcRegex = /^(1|3|bc1q|bc1p)[a-zA-Z0-9]{25,62}$/;
          const ethRegex = /^0x[a-fA-F0-9]{40}$/;
          return this.asset === 'BTC' ? btcRegex.test(v) : ethRegex.test(v);
        },
        message: props => `Invalid ${props.value} address format for selected asset`,
      },
    },
    amount: {
      type: Number,
      required: [true, 'Withdrawal amount is required'],
      min: [0.00001, 'Amount too small'], // Lowered for 2026 satoshi-level compatibility
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'sent', 'failed'],
      default: 'pending',
      index: true,
    },
    txHash: { type: String, trim: true, sparse: true },
    adminNote: { type: String, trim: true, maxlength: 500 },
    fee: { type: Number, default: 0, min: 0 },
    netAmount: { type: Number, min: 0 },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for frontend-friendly createdAt
withdrawalSchema.virtual('formattedDate').get(function () {
  return this.createdAt.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
});

// Pre-save hook: Ensure netAmount is calculated
withdrawalSchema.pre('save', function (next) {
  if (this.amount != null) {
    this.netAmount = this.amount - (this.fee || 0);
  }
  next();
});

// Optimized Indexes
withdrawalSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('Withdrawal', withdrawalSchema);

