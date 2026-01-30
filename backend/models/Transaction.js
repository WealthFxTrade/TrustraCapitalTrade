import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, required: true, enum: ['deposit', 'withdrawal', 'profit', 'bonus', 'referral'], index: true },
    amount: { type: Number, required: true, min: 0 },
    signedAmount: { type: Number, required: true },
    currency: { type: String, default: 'USD', enum: ['USD', 'BTC', 'USDT', 'ETH'] },
    status: { type: String, enum: ['pending', 'completed', 'rejected', 'failed'], default: 'pending', index: true },
    method: { type: String, enum: ['crypto', 'bank_transfer', 'wallet', 'manual'], default: 'manual' },
    txHash: { type: String, trim: true, sparse: true },
    walletAddress: { type: String, trim: true, sparse: true },
    adminNote: String,
  },
  { timestamps: true }
);

// Auto-calculate signedAmount
transactionSchema.pre('save', function (next) {
  if (this.isModified('amount') || this.isNew) {
    const incoming = ['deposit', 'profit', 'bonus', 'referral'].includes(this.type);
    this.signedAmount = incoming ? Math.abs(this.amount) : -Math.abs(this.amount);
  }
  next();
});

// Optional compound index for common queries
transactionSchema.index({ user: 1, status: 1, type: 1 });

export default mongoose.model('Transaction', transactionSchema);
