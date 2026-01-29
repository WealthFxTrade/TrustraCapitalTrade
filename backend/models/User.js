// backend/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const planReturns = {
  'Rio Starter': 0.075,   // ~7.5% monthly (range 6–9%)
  'Rio Basic': 0.105,     // ~10.5% (9–12%)
  'Rio Standard': 0.14,   // ~14% (12–16%)
  'Rio Advanced': 0.18,   // ~18% (16–20%)
  'Rio Elite': 0.225      // ~22.5% (20–25%)
};

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false, // never return password in queries
    },

    balance: {
      type: Number,
      default: 0,
      min: [0, 'Balance cannot be negative'],
    },

    plan: {
      type: String,
      enum: ['None', 'Rio Starter', 'Rio Basic', 'Rio Standard', 'Rio Advanced', 'Rio Elite'],
      default: 'None',
    },

    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },

    kycStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },

    kycDocuments: {
      type: [String], // array of document URLs, file IDs, or paths
      default: [],
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationToken: {
      type: String,
      sparse: true,
    },

    verificationTokenExpires: {
      type: Date,
      sparse: true,
    },

    lastProfitUpdate: {
      type: Date,
      default: Date.now,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: daily profit rate (monthly rate → daily)
userSchema.virtual('dailyRate').get(function () {
  if (this.plan === 'None' || !this.plan) return 0;
  return (planReturns[this.plan] || 0) / 30;
});

// Pre-save hook: hash password if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method: compare password for login
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Pre-save hook: prevent negative balance
userSchema.pre('save', function (next) {
  if (this.balance < 0) {
    this.balance = 0;
  }
  next();
});

export default mongoose.model('User', userSchema);
