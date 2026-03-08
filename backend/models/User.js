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
    enum: ['deposit', 'withdrawal', 'yield', 'investment', 'transfer'], 
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
    trim: true
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
    required: true 
  },
  role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user' 
  },

  // ── BALANCE PROTOCOL ──
  // Using a Map allows for flexible multi-currency support
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
  kycStatus: { 
    type: String, 
    enum: ['pending', 'verified', 'rejected', 'unsubmitted'], 
    default: 'unsubmitted' 
  },
  isBanned: { type: Boolean, default: false },

  ledger: [ledgerSchema]
}, {
  timestamps: true,
  // Ensure Maps and Virtuals are handled correctly when converted to JSON
  toJSON: { virtuals: true, flattenMaps: false },
  toObject: { virtuals: true, flattenMaps: false }
});

/**
 * ── MIDDLEWARE: PASSWORD ENCRYPTION ──
 */
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
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
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
