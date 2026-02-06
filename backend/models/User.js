import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  phone: { type: String, default: '' }, // REQUIRED for Profile UI
  role: { type: String, default: 'user' },
  plan: { type: String, default: 'none' },
  balances: {
    type: Map,
    of: Number,
    default: { BTC: 0, USD: 0, USDT: 0 }
  },
  btcAddress: { type: String, unique: true, sparse: true },
  btcIndex: { type: Number, default: 0 },
  ledger: [{
    amount: Number,
    currency: String,
    type: String,
    status: { type: String, default: 'completed' },
    createdAt: { type: Date, default: Date.now }
  }],
  isActive: { type: Boolean, default: true },
  banned: { type: Boolean, default: false }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (pass) {
  return await bcrypt.compare(pass, this.password);
};

export default mongoose.models.User || mongoose.model('User', userSchema);

