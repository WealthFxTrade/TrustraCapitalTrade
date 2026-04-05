// models/Withdrawal.js
import mongoose from 'mongoose';

const withdrawalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true, min: [50, 'Minimum withdrawal €50'] },
    asset: { type: String, required: true, uppercase: true, trim: true, default: 'BTC' },
    walletType: { type: String, required: true, enum: ['EUR', 'ROI'], default: 'EUR', uppercase: true },
    address: { type: String, required: true, trim: true },
    network: { type: String, trim: true, default: 'Mainnet' },
    status: { type: String, enum: ['pending', 'processing', 'completed', 'cancelled', 'rejected'], default: 'pending', index: true },
    transactionHash: { type: String, trim: true, sparse: true },
    fee: { type: Number, default: 0, min: 0 },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    rejectionReason: { type: String, trim: true, maxlength: 200, default: null },
    currency: { type: String, default: 'EUR', uppercase: true },
    netAmount: { type: Number },
    signedAmount: { type: Number },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Auto-compute signedAmount and netAmount
withdrawalSchema.pre('validate', function (next) {
  this.netAmount = this.amount - (this.fee || 0);
  this.signedAmount = -Math.abs(this.netAmount); // Always negative
  if (this.netAmount < 0) this.invalidate('netAmount', 'Net amount cannot be negative');
  next();
});

// Indexes
withdrawalSchema.index({ user: 1, createdAt: -1 });
withdrawalSchema.index({ status: 1, createdAt: -1 });

const Withdrawal = mongoose.model('Withdrawal', withdrawalSchema);
export default Withdrawal;
