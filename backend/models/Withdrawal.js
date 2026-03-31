// models/Withdrawal.js
import mongoose from 'mongoose';

const withdrawalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Withdrawal must belong to a user'],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [50, 'Minimum redemption threshold is €50.00'], // Updated to match business logic
    },
    // The asset requested (BTC, ETH, etc.)
    asset: {
      type: String,
      required: [true, 'Target asset is required'],
      uppercase: true,
      trim: true,
      default: 'BTC',
    },
    // CRITICAL: Which internal pool the money is coming from
    walletType: {
      type: String,
      required: [true, 'Source liquidity pool is required'],
      enum: ['EUR', 'ROI'],
      default: 'EUR',
      uppercase: true,
    },
    address: {
      type: String,
      required: [true, 'Withdrawal destination address is required'],
      trim: true,
    },
    network: {
      type: String,
      required: [false, 'Network protocol'], // Made optional as some assets are mainnet-only
      trim: true,
      default: 'Mainnet',
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'cancelled', 'rejected'],
      default: 'pending',
      index: true,
    },
    transactionHash: {
      type: String,
      trim: true,
      sparse: true,
    },
    fee: {
      type: Number,
      default: 0,
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: 200,
      default: null,
    },
    // Redundant but kept for legacy compatibility with your controller
    currency: {
      type: String,
      default: 'EUR',
      uppercase: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
withdrawalSchema.index({ user: 1, createdAt: -1 });
withdrawalSchema.index({ status: 1, createdAt: -1 });

const Withdrawal = mongoose.model('Withdrawal', withdrawalSchema);
export default Withdrawal;
