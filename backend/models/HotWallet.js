import mongoose from 'mongoose';

const hotWalletSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',       // links to your User collection
      required: true,
    },
    address: {
      type: String,
      required: true,
      unique: true,      // ensures no duplicate BTC addresses
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    index: {
      type: Number,       // optional: track derivation index
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      default: 0,        // backend can update as deposits are confirmed
    },
  },
  {
    versionKey: false,
  }
);

const HotWallet = mongoose.model('HotWallet', hotWalletSchema);

export default HotWallet;
