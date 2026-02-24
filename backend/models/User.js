import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// ──────────────────────────────────────────────
// SUB-SCHEMAS
// ──────────────────────────────────────────────
const btcDepositSchema = new mongoose.Schema({
  txid: { type: String, required: true },
  vout: { type: Number, default: 0 },
  amountSats: { type: Number, required: true },
  amountBtc: { type: Number, required: true },
  amountEur: { type: Number, default: 0 },
  blockHeight: { type: Number },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'credited', 'failed'],
    default: 'credited'
  },
  creditedAt: { type: Date, default: Date.now }
});

const ledgerSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  currency: { type: String, default: 'EUR' },
  type: {
    type: String,
    enum: ['deposit', 'withdrawal', 'investment', 'profit', 'roi_profit', 'bonus', 'exchange'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'completed'
  },
  description: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

// ──────────────────────────────────────────────
// USER SCHEMA
// ──────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  isCounter: { type: Boolean, default: false, select: false },
  fullName: {
    type: String,
    required: function () { return !this.isCounter; },
    trim: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
    validate: {
      validator(v) {
        if (!v) return true;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Invalid email format'
    },
    set: (v) => (v && v.trim() !== '' ? v.trim().toLowerCase() : undefined)
  },
  password: {
    type: String,
    required: function () { return !this.isCounter; },
    select: false
  },
  phone: { type: String, trim: true },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  plan: { type: String, default: 'none' },
  investedAmount: { type: Number, default: 0 },
  dailyRoiRate: { type: Number, default: 0 },
  planDaysServed: { type: Number, default: 0 },
  planDuration: { type: Number, default: 0 },
  lastProfitDate: { type: Date },
  balances: {
    BTC: { type: Number, default: 0 },
    EUR: { type: Number, default: 0 },
    EUR_PROFIT: { type: Number, default: 0 },
    USDT: { type: Number, default: 0 }
  },
  btcAddress: { type: String, sparse: true },
  btcDeposits: {
    type: [btcDepositSchema],
    default: []
  },
  ledger: {
    type: [ledgerSchema],
    default: []
  },
  isActive: { type: Boolean, default: true },
  banned: { type: Boolean, default: false }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

userSchema.virtual('isAdmin').get(function () {
  return this.role === 'admin';
});

// ──────────────────────────────────────────────
// PRE-SAVE HOOK
// ──────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  try {
    if (this.isCounter) return next();

    if (this.isModified('password') && this.password) {
      const isAlreadyHashed = /^$2[aby]$\d{2}$/.test(this.password);
      if (!isAlreadyHashed) {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
      }
    }
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
