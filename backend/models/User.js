import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    required: true,
    index: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  phone: {
    type: String,
    trim: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },

  // ── WALLET INFRASTRUCTURE ──
  // This Map stores multiple chain addresses (BTC, ETH, USDT)
  depositAddresses: {
    type: Map,
    of: String,
    default: () => new Map(),
  },
  btcAddress: {
    type: String,
    sparse: true,
    index: true,
  },
  ethAddress: {
    type: String,
    sparse: true,
  },

  // ── GLOBAL COUNTER LOGIC ──
  isCounter: {
    type: Boolean,
    default: false,
  },
  btcIndexCounter: {
    type: Number,
    default: 0
  },

  // ── FINANCIALS ──
  // Defaulting keys to match your Dashboard keys
  balances: {
    type: Map,
    of: Number,
    default: () => new Map([['EUR', 0], ['BTC', 0], ['ROI', 0]]),
  },
  activePlan: {
    type: String,
    default: 'Standard Node',
  },
  totalBalance: {
    type: Number,
    default: 0,
  },
  totalProfit: {
    type: Number,
    default: 0,
  },

  // ── SYSTEM STATE & SECURITY ──
  isActive: { type: Boolean, default: true },
  banned: { type: Boolean, default: false },
  kycStatus: {
    type: String,
    enum: ['unverified', 'pending', 'verified', 'rejected'],
    default: 'unverified',
  },

  // ── UNIVERSAL OTP PROTOCOL ──
  otpCode: {
    type: String,
    default: null
  },
  otpExpires: {
    type: Date,
    default: null
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  }

}, {
  timestamps: true,
});

// ── MIDDLEWARE: PW HASHING ──
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password method for login authentication
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// ── SCHEMATIC INDEXES ──
userSchema.index(
  { isCounter: 1 },
  { unique: true, partialFilterExpression: { isCounter: true } }
);

const User = mongoose.model('User', userSchema);
export default User;
