import mongoose from 'mongoose';

const depositSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
    index: true
  },
  amount: { type: Number, required: true }, // Amount in BTC or Satoshi
  amountUSD: { type: Number },
  currency: { type: String, default: 'BTC', uppercase: true },
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
  confirmations: { type: Number, default: 0 },
  address: { type: String, required: true }, // The btcAddress it was sent to
  locked: { type: Boolean, default: false }, // For the Deposit Watcher cron job
}, { timestamps: true });

// Safe Export
export default mongoose.models.Deposit || mongoose.model('Deposit', depositSchema);

