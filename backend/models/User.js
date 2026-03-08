import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * ── LEDGER SCHEMA ──
 * Records every financial movement for the user node
 */
const ledgerSchema = mongoose.Schema({
  amount: { type: Number, required: true },
  currency: { type: String, default: 'EUR' },
  type: {
    type: String,
    enum: ['deposit', 'withdrawal', 'yield', 'investment', 'transfer', 'referral_bonus', 'override'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'rejected', 'cancelled'],
    default: 'pending'
  },
  address: { type: String },
  description: { type: String },
}, { timestamps: true });

/**
 * ── USER SCHEMA ──
 * The core identity protocol for Trustra Capital Trade
 */
const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Identity name is required for registration']
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Secure contact protocol (phone) is required']
  },
  password: {
    type: String,
    required: true,
    select: false // Protection: Password won't be returned in queries by default
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },

  // ── 🟡 REFERRAL PROTOCOL (B) ──
  referralCode: {
    type: String,
    unique: true,
    default: () => Math.random().toString(36).substring(2, 8).toUpperCase()
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  referralCount: { type: Number, default: 0 },
  referralEarnings: { type: Number, default: 0 },

  // ── BALANCE PROTOCOL ──
  balances: {
    type: Map,
    of: Number,
    default: { 'EUR': 0, 'ROI': 0, 'BTC': 0, 'USDT': 0 }
  },

  // ── RESET PROTOCOL ──
  resetPasswordOTP: { type: String },
  resetPasswordExpires: { type: Date },

  // ── 🟢 INVESTMENT STATE (A) ──
  totalBalance: { type: Number, default: 0 },
  totalProfit: { type: Number, default: 0 },
  activePlan: { type: String, default: 'none' },
  isActive: { type: Boolean, default: true },
  lastRoiAt: { type: Date },

  // ── COMPLIANCE ──
  kycStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected', 'unsubmitted'],
    default: 'unsubmitted'
  },
  isBanned: { type: Boolean, default: false },
  
  ledger: [ledgerSchema]
}, {
  timestamps: true,
  toJSON: { virtuals: true, flattenMaps: false },
  toObject: { virtuals: true, flattenMaps: false }
});



/**
 * ── VIRTUALS: LIVE GROWTH DATA ──
 * Helps the Quantum Counter calculate speed on the fly
 */
userSchema.virtual('dailyRate').get(function() {
  const rates = {
    'Rio Starter': 0.0025,
    'Rio Basic': 0.0035,
    'Rio Standard': 0.0048,
    'Rio Advanced': 0.0062,
    'Rio Elite': 0.0125 // Institutional Tier
  };
  return rates[this.activePlan] || 0;
});

/**
 * ── MIDDLEWARE: PASSWORD ENCRYPTION ──
 */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * ── METHODS: CIPHER VERIFICATION ──
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
