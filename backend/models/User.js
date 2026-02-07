import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Sub-schema for ledger
const ledgerSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
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
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  phone: { type: String, default: '' },
  role: { type: String, default: 'user', enum: ['user', 'admin'] },
  plan: { type: String, default: 'none' },
  isPlanActive: { type: Boolean, default: false },
  balances: {
    type: Map,
    of: Number,
    default: { BTC: 0, USD: 0, USDT: 0 }
  },
  
  // CRITICAL FIX: Add this field to store generated crypto addresses
  depositAddresses: {
    type: Map,
    of: String,
    default: {}
  },

  ledger: [ledgerSchema], 
  isActive: { type: Boolean, default: true },
  banned: { type: Boolean, default: false }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (pass) {
  return await bcrypt.compare(pass, this.password);
};

export default mongoose.models.User || mongoose.model('User', userSchema);

