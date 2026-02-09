import mongoose from 'mongoose';

/**
 * Trustra Capital Trade - Withdrawal Schema (Rio Series 2026)
 * Multi-asset support with on-chain address validation.
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
      enum: ['BTC', 'ETH', 'USDT'],
      required: [true, 'Asset type is required'],
      default: 'BTC'
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
          
          return this.asset === 'BTC' ? btcRegex.test(v) : ethRegex.test(v);
        },
        message: props => `Format error: ${props.value} is not a valid address for the selected network.`
      },
    },
    amount: {
      type: Number,
      required: [true, 'Withdrawal amount is required'],
      min: [0.00001, 'Minimum node depth not reached (0.00001 min)'],
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

// Optimized Multi-key Index for fast history lookups
withdrawalSchema.index({ user: 1, createdAt: -1 });

const Withdrawal = mongoose.models.Withdrawal || mongoose.model('Withdrawal', withdrawalSchema);
export default Withdrawal;

