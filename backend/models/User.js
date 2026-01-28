// backend/models/User.js
import mongoose from 'mongoose';

const planReturns = {
  'Rio Starter': 0.075,   // average 7.5% monthly (6–9%)
  'Rio Basic': 0.105,     // 10.5% (9–12%)
  'Rio Standard': 0.14,   // 14% (12–16%)
  'Rio Advanced': 0.18,   // 18% (16–20%)
  'Rio Elite': 0.225      // 22.5% (20–25%)
};

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
    },
    fullName: {
      type: String,
      trim: true,
    },
    balance: {
      type: Number,
      default: 0,
      min: 0,
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
      type: [String], // array of document URLs or file paths
      default: [],
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
    timestamps: true, // auto-adds createdAt & updatedAt
    toJSON: { virtuals: true }, // include virtuals in JSON output
    toObject: { virtuals: true },
  }
);

// Virtual field: daily profit rate based on plan
userSchema.virtual('dailyRate').get(function () {
  if (this.plan === 'None' || !this.plan) return 0;
  return (planReturns[this.plan] || 0) / 30; // monthly rate → daily
});

// Optional: pre-save hook to ensure balance never goes negative
userSchema.pre('save', function (next) {
  if (this.balance < 0) {
    this.balance = 0;
  }
  next();
});

export default mongoose.model('User', userSchema);
