import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Sub-schema for ledger (Internal transactions)
const ledgerSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  currency: { type: String, default: 'EUR' }, 
  type: {
    type: String,
    enum: ['deposit', 'withdrawal', 'investment', 'roi_profit', 'bonus'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  description: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true 
  },
  password: { 
    type: String, 
    required: true, 
    select: false // Security: Never include password in general queries
  },
  phone: { type: String, default: '', trim: true },
  role: { type: String, default: 'user', enum: ['user', 'admin'] },
  
  // Investment State
  plan: { type: String, default: 'none' },
  isPlanActive: { type: Boolean, default: false },

  // Wallet Balances
  balances: {
    type: Map,
    of: Number,
    default: () => new Map([
      ['BTC', 0],
      ['EUR', 0],
      ['USDT', 0]
    ])
  },

  // Crypto Deposit Addresses
  depositAddresses: {
    type: Map,
    of: String,
    default: () => new Map()
  },

  // BTC Indexing for Address Derivation (used in auth.js)
  btcIndex: { type: Number, default: 0 },
  btcAddress: { type: String },

  ledger: [ledgerSchema],

  // Security & Account Status
  isActive: { type: Boolean, default: true },
  banned: { type: Boolean, default: false },

  // Password Reset Fields (Crucial for auth.js /forgot-password)
  resetOtp: { type: String, select: false },
  resetOtpExpires: { type: Date, select: false },
  resetOtpResendAt: { type: Date, select: false }

}, { 
  timestamps: true,
  toJSON: { virtuals: true }, 
  toObject: { virtuals: true } 
});

// 1. Hash password before saving to DB
userSchema.pre('save', async function (next) {
  // Only hash if the password field is actually being changed
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// 2. Method to compare login password with hashed DB password
userSchema.methods.comparePassword = async function (enteredPassword) {
  // Note: 'this.password' is only available if .select('+password') was used in the query
  return await bcrypt.compare(enteredPassword, this.password);
};

// 3. Prevent OverwriteModelError in Development (Important for Hot Reloading)
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;

