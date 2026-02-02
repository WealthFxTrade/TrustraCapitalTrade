import mongoose from 'mongoose';

const depositSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    currency: {
      type: String,
      enum: ['BTC'],
      default: 'BTC',
      required: true,
      index: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    expectedAmount: {
      type: Number,
      min: 0,
    },

    receivedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    amountSat: {
      type: mongoose.Schema.Types.Decimal128,
      default: '0',
      get: v => Number(v),
      set: v => mongoose.Types.Decimal128.fromString(v.toString()),
    },

    txHash: {
      type: String,
      trim: true,
      sparse: true,
      index: { unique: true, sparse: true },
    },

    confirmations: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: [
        'pending',
        'confirming',
        'confirmed',
        'overpaid',
        'underpaid',
        'expired',
        'error',
      ],
      default: 'pending',
      index: true,
    },

    firstSeenAt: Date,
    blockHeight: Number,

    adminNote: String,

    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      sparse: true,
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

depositSchema.index({ user: 1, createdAt: -1 });

depositSchema.virtual('amountBTC').get(function () {
  return Number(this.amountSat) / 1e8;
});

export default mongoose.model('Deposit', depositSchema);
