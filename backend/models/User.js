import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Please add a name'], trim: true },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please add a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 8,
    select: false 
  },
  role: { type: String, enum: ['user', 'admin', 'superadmin'], default: 'user' },
  isActive: { type: Boolean, default: true },
  isBanned: { type: Boolean, default: false },

  balances: {
    type: Map,
    of: Number,
    default: () => new Map([
      ['EUR', 0],
      ['BTC', 0],
      ['USDT', 0],
      ['ROI', 0],
      ['INVESTED', 0]
    ])
  },

  isNodeActive: { type: Boolean, default: false },
  activePlan: { type: String, default: 'None' },
  kycStatus: { type: String, enum: ['unverified', 'pending', 'submitted', 'verified', 'rejected'], default: 'unverified' },
  kycNotes: { type: String, default: null },
  kycVerifiedAt: { type: Date, default: null },
  idFrontUrl: { type: String, default: null },
  idBackUrl: { type: String, default: null },
  selfieUrl: { type: String, default: null },

  resetPasswordToken: String,
  resetPasswordExpire: Date,

  twoFactorEnabled: { type: Boolean, default: false }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ── PASSWORD HASHING ──
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── PASSWORD MATCHING ──
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
