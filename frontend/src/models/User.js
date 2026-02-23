const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    // FIX: Changed from Number to Map to support EUR and BTC wallets
    balances: {
      type: Map,
      of: Number,
      default: { EUR: 0, BTC: 0, USDT: 0 },
    },
    // Required for the "Failed to generate BTC address" fix
    depositAddresses: {
      type: Map,
      of: String, 
      default: {},
    },
    investments: [
      {
        planName: String,
        amount: Number,
        currency: { type: String, default: 'EUR' }, // Added to track Euro investments
        roiDaily: Number,
        duration: Number,
        startDate: { type: Date, default: Date.now },
        nextReturn: Date,
        totalProfit: { type: Number, default: 0 },
        status: {
          type: String,
          enum: ['running', 'completed', 'cancelled'],
          default: 'running',
        },
      },
    ],
    // Ledger added for Recent Activity table in dashboard
    ledger: [
      {
        amount: Number,
        currency: { type: String, default: 'EUR' },
        type: { type: String, enum: ['deposit', 'withdrawal', 'investment', 'roi_profit'] },
        status: { type: String, default: 'completed' },
        description: String,
        createdAt: { type: Date, default: Date.now }
      }
    ],
    isActive: { type: Boolean, default: true },
    banned: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Password hashing before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Password comparison method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

