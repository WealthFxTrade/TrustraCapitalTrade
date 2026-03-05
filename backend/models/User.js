import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const ledgerSchema = mongoose.Schema({
  amount: { type: Number, required: true },
  currency: { type: String, default: 'EUR' },
  type: { type: String, enum: ['deposit', 'withdrawal', 'yield', 'investment'], required: true },
  status: { type: String, enum: ['pending', 'completed', 'rejected', 'cancelled'], default: 'pending' },
  address: { type: String }, // For crypto extractions
  description: { type: String },
}, { timestamps: true });

const userSchema = mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  
  // ── BALANCE PROTOCOL ──
  // Using a Map allows dynamic keys like user.balances.get('ROI')
  balances: {
    type: Map,
    of: Number,
    default: { 'EUR': 0, 'ROI': 0, 'BTC': 0 }
  },

  // ── INVESTMENT STATE ──
  totalBalance: { type: Number, default: 0 }, // Total Principal
  totalProfit: { type: Number, default: 0 },  // Total Earned
  activePlan: { type: String, default: 'None' },
  isActive: { type: Boolean, default: false },

  // ── COMPLIANCE ──
  kycStatus: { type: String, enum: ['pending', 'verified', 'rejected', 'unsubmitted'], default: 'unsubmitted' },
  isBanned: { type: Boolean, default: false },

  // ── HISTORY ──
  ledger: [ledgerSchema]
}, { timestamps: true });

// Password hashing middleware
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Cipher verification method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
