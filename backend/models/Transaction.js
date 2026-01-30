// backend/models/Transaction.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    txid: {
      type: String,
      sparse: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'BTC',
      enum: ['BTC', 'USDT', 'ETH'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'failed'],
      default: 'pending',
      index: true,
    },
    method: {
      type: String,
      enum: ['crypto', 'bank', 'wallet', 'manual'],
      default: 'crypto',
    },
    adminNote: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);
