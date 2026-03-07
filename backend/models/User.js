import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const ledgerSchema = mongoose.Schema({
  amount: { type: Number, required: true },
  currency: { type: String, default: 'EUR' },
  type: { type: String, enum: ['deposit', 'withdrawal', 'yield', 'investment', 'transfer'], required: true },
  status: { type: String, enum: ['pending', 'completed', 'rejected', 'cancelled'], default: 'pending' },
  address: { type: String },
  description: { type: String },
}, { timestamps: true });

const userSchema = mongoose.Schema({
  name: { type: String },
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Removed select: false to prevent login handshake failure
  role: { type: String, enum: ['user', 'admin'], default: 'user' },

  // ── BALANCE PROTOCOL ──
  balances: {
    type: Map,
    of: Number,
    default: { 'EUR': 0, 'ROI': 0, 'BTC': 0, 'USDT': 0 }
  },

  // ── RESET PROTOCOL ──
  resetPasswordOTP: { type: String },
  resetPasswordExpires: { type: Date },

  // ── INVESTMENT STATE ──
  totalBalance: { type: Number, default: 0 },
  totalProfit: { type: Number, default: 0 },
  activePlan: { type: String, default: 'none' },
  isActive: { type: Boolean, default: true },
  lastRoiAt: { type: Date },

  // ── COMPLIANCE ──
  kycStatus: { type: String, enum: ['pending', 'verified', 'rejected', 'unsubmitted'], default: 'unsubmitted' },
  isBanned: { type: Boolean, default: false },

  ledger: [ledgerSchema]
}, {
  timestamps: true,
  // ensure Maps are handled correctly when sending to frontend
  toJSON: { virtuals: true, flattenMaps: false },
  toObject: { virtuals: true, flattenMaps: false }
});

// Password hashing middleware
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

// Cipher verification method
userSchema.methods.matchPassword = async function (enteredPassword) {
  // Explicitly check if password exists (in case select: false was used elsewhere)
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
