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
      enum: ['BTC', 'ETH', 'USDT', 'EUR'], // Added EUR for internal ledger tracking
      required: [true, 'Asset type is required'],
      default: 'BTC'
    },
    // ✅ NEW: Tracks if funds came from 'main' or 'profit' for 2026 Audit Integrity
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
          // BTC: Legacy (1), Segwit (3), Native Segwit (bc1q), Taproot (bc1p)
          const btcRegex = /^(1|3|bc1q|bc1p)[a-zA-Z0-9]{25,62}$/;
          // ETH & USDT (ERC-20): 0x followed by 40 hex chars
          const ethRegex = /^0x[a-fA-F0-9]{40}$/;
          // If asset is EUR (internal), skip regex or return true
          if (this.asset === 'EUR') return true;

          return this.asset === 'BTC' ? btcRegex.test(v) : ethRegex.test(v);
        },
        message: props => `Format error: ${props.value} is not a valid address for the selected network.`
      },
    },
    amount: {
      type: Number,
      required: [true, 'Withdrawal amount is required'],
      min: [50, 'Minimum withdrawal depth: €50.00'], // Updated to your project minimum
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
      sparse: true,
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

// Virtual for formatted date (Dashboard friendly)
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
  if (this.amount != null) {
    this.netAmount = Math.max(0, this.amount - (this.fee || 0));
  }
  next();
});

// Optimized Indexing
withdrawalSchema.index({ user: 1, createdAt: -1 });

const Withdrawal = mongoose.models.Withdrawal || mongoose.model('Withdrawal', withdrawalSchema);
export default Withdrawal;

