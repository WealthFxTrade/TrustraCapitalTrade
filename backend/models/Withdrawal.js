import mongoose from 'mongoose';

/**
 * Trustra Capital Trade - Withdrawal Schema (Rio Series 2026)
 * Multi-asset support with on-chain address validation & Wallet Source tracking.
 */
const withdrawalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User Node ID is required'],
      index: true,
    },
    asset: {
      type: String,
      enum: ['BTC', 'ETH', 'USDT', 'EUR'],
      required: [true, 'Asset type is required'],
      default: 'BTC'
    },
    walletSource: {
      type: String,
      enum: ['main', 'profit'],
      required: [true, 'Source wallet (main/profit) is required'],
      default: 'main'
    },
    address: {
      type: String,
      required: [true, 'Destination address is required'],
      trim: true,
      validate: {
        validator: function(v) {
          // Access 'asset' from the document being saved
          const assetType = this.asset;
          
          if (assetType === 'EUR') return true; // Internal bank transfers
          
          // BTC: Legacy (1), Segwit (3), Native Segwit (bc1q), Taproot (bc1p)
          const btcRegex = /^(1|3|bc1q|bc1p)[a-zA-Z0-9]{25,62}$/;
          // ETH & USDT (ERC-20): 0x followed by 40 hex chars
          const ethRegex = /^0x[a-fA-F0-9]{40}$/;

          if (assetType === 'BTC') return btcRegex.test(v);
          if (assetType === 'ETH' || assetType === 'USDT') return ethRegex.test(v);
          
          return false;
        },
        message: props => `Format error: ${props.value} is not a valid address for the selected network.`
      },
    },
    amount: {
      type: Number,
      required: [true, 'Withdrawal amount is required'],
      min: [50, 'Minimum withdrawal depth: €50.00'],
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
      sparse: true, // Allows multiple null values
      index: true
    },
    adminNote: {
      type: String,
      trim: true,
      maxlength: 500
    },
    fee: {
      type: Number,
      default: 0,
      min: 0
    },
    netAmount: {
      type: Number,
      min: 0
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for formatted date
withdrawalSchema.virtual('formattedDate').get(function () {
  return this.createdAt.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
});

// Pre-save hook: Automatic Net Calculation
withdrawalSchema.pre('save', function (next) {
  if (this.isModified('amount') || this.isModified('fee')) {
    this.netAmount = Math.max(0, (this.amount || 0) - (this.fee || 0));
  }
  next();
});

// Compound Indexing for fast Dashboard queries
withdrawalSchema.index({ user: 1, createdAt: -1 });

const Withdrawal = mongoose.models.Withdrawal || mongoose.model('Withdrawal', withdrawalSchema);

export default Withdrawal;
