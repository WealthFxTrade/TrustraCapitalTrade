import mongoose from 'mongoose';

const depositSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  amount: { type: Number, required: true },      // Amount in BTC or crypto
  amountEUR: { type: Number },                   // Converted to Euros
  currency: { type: String, default: 'BTC', uppercase: true },
  txHash: { type: String, unique: true, sparse: true, trim: true, index: true },
  status: { type: String, enum: ['pending','confirming','confirmed','failed','rejected'], default: 'pending', index: true },
  confirmations: { type: Number, default: 0 },
  address: { type: String, required: true },
  locked: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.Deposit || mongoose.model('Deposit', depositSchema);
