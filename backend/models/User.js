// models/User.js - Production Optimized v8.4.1
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
  
  // ── BITCOIN INFRASTRUCTURE ──
  btcAddress: {
    type: String,
    unique: true,
    sparse: true, 
    index: true,  
  },
  btcIndex: {
    type: Number,
    unique: true,
    sparse: true,
  },
  
  // ── GLOBAL COUNTER LOGIC ──
  isCounter: { 
    type: Boolean, 
    default: false,
    // FIX: Removed 'index: true' here to stop Mongoose warning
  },
  btcIndexCounter: { 
    type: Number, 
    default: 0 
  },

  // ── FINANCIALS ──
  balances: {
    type: Map,
    of: Number,
    default: () => new Map([['EUR', 0], ['BTC', 0], ['ROI', 0]]),
  },
  activePlan: {
    type: String,
    default: 'None',
  },
  totalBalance: {
    type: Number,
    default: 0,
  },
  totalProfit: {
    type: Number,
    default: 0,
  },

  // ── SYSTEM STATE ──
  isActive: { type: Boolean, default: true },
  banned: { type: Boolean, default: false },
  kycStatus: {
    type: String,
    enum: ['unverified', 'pending', 'verified', 'rejected'],
    default: 'unverified',
  },
}, {
  timestamps: true,
});

// ── MIDDLEWARE ──

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// ── SCHEMATIC INDEXES ──
// FIX: This is the ONLY index required for isCounter. 
// It allows multiple 'false' values but only one 'true' (The Global Counter).
userSchema.index(
  { isCounter: 1 }, 
  { unique: true, partialFilterExpression: { isCounter: true } }
);

const User = mongoose.model('User', userSchema);
export default User;

