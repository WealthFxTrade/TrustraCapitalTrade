import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const ledgerSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  signedAmount: { type: Number, required: true }, 
  currency: { type: String, required: true, uppercase: true },
  type: {
    type: String,
    enum: ['deposit', 'withdrawal', 'profit', 'bonus', 'referral', 'adjustment'],
    required: true,
  },
  source: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'rejected'],
    default: 'completed',
  },
  referenceId: { type: mongoose.Schema.Types.ObjectId, sparse: true },
  description: { type: String, trim: true },
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user', index: true },
  plan: { type: String, enum: ['none', 'basic', 'premium', 'vip'], default: 'none' },
  balances: {
    type: Map,
    of: Number,
    default: { BTC: 0, USD: 0, USDT: 0 },
  },
  btcAddress: { type: String, unique: true, sparse: true, lowercase: true },
  btcIndex: { type: Number, default: 0 },
  ledger: [ledgerSchema],
  isActive: { type: Boolean, default: true },
  banned: { type: Boolean, default: false },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
}, { timestamps: true });

// Password Hashing
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance Method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Safe Export: Checks if model exists before compiling
export default mongoose.models.User || mongoose.model('User', userSchema);

