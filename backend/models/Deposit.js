import mongoose from 'mongoose';

/**
 * Trustra Capital Trade - Deposit Schema (Rio Series 2026)
 * Handles deterministic node deposits and EUR value indexing.
 */
const depositSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // The raw crypto amount (e.g., 0.05 BTC)
  amount: { 
    type: Number, 
    required: true,
    min: [0, 'Amount cannot be negative']
  },
  // The value in Euros at the time of deposit confirmation
  amountEUR: { 
    type: Number,
    default: 0
  },
  currency: { 
    type: String, 
    default: 'BTC', 
    uppercase: true,
    enum: ['BTC', 'ETH', 'USDT', 'EUR']
  },
  // Transaction hash from the blockchain
  txHash: { 
    type: String, 
    unique: true, 
    sparse: true, 
    trim: true, 
    index: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'confirming', 'confirmed', 'failed', 'rejected'], 
    default: 'pending', 
    index: true 
  },
  confirmations: { 
    type: Number, 
    default: 0 
  },
  // The specific node address funds were sent to
  address: { 
    type: String, 
    required: true,
    trim: true
  },
  // Prevents concurrent processing during node sync
  locked: { 
    type: Boolean, 
    default: false 
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual to check if funds are fully available in the EUR balance
depositSchema.virtual('isFinalized').get(function() {
  return this.status === 'confirmed';
});

export default mongoose.models.Deposit || mongoose.model('Deposit', depositSchema);

