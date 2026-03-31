import mongoose from 'mongoose';

const ledgerEntrySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['credit', 'debit'], required: true, index: true },
    source: { type: String, enum: ['deposit', 'withdrawal', 'admin_adjustment', 'trade'], required: true, index: true },
    currency: { type: String, enum: ['BTC', 'ETH', 'EUR'], required: true, index: true },
    amount: { 
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      get: v => Number(v),
      set: v => mongoose.Types.Decimal128.fromString(v.toString()),
    },
    referenceId: { type: mongoose.Schema.Types.ObjectId, index: true },
    description: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, toJSON: { getters: true }, toObject: { getters: true } }
);

// Ledger is immutable
ledgerEntrySchema.pre(['updateOne', 'findOneAndUpdate', 'deleteOne'], () => {
  throw new Error('Ledger entries are immutable');
});

export default mongoose.model('LedgerEntry', ledgerEntrySchema);
