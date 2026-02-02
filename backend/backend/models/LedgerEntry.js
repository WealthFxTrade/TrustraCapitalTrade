import mongoose from 'mongoose';

const ledgerEntrySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ['credit', 'debit'],
      required: true,
      index: true,
    },

    source: {
      type: String,
      enum: ['deposit', 'withdrawal', 'admin_adjustment', 'trade'],
      required: true,
      index: true,
    },

    currency: {
      type: String,
      enum: ['BTC', 'USD'],
      required: true,
      index: true,
    },

    // Always store smallest unit
    // BTC → satoshis
    // USD → cents
    amount: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      get: v => Number(v),
      set: v => mongoose.Types.Decimal128.fromString(v.toString()),
    },

    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true, // depositId, withdrawalId, tradeId, etc.
    },

    description: {
      type: String,
      trim: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // admin if manual
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

// 🚨 Ledger is immutable
ledgerEntrySchema.pre('updateOne', () => {
  throw new Error('Ledger entries are immutable');
});
ledgerEntrySchema.pre('findOneAndUpdate', () => {
  throw new Error('Ledger entries are immutable');
});
ledgerEntrySchema.pre('deleteOne', () => {
  throw new Error('Ledger entries are immutable');
});

export default mongoose.model('LedgerEntry', ledgerEntrySchema);
