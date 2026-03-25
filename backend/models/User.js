// models/User.js - FULL UNSHORTENED VERSION (Updated March 2026)
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const ledgerSchema = mongoose.Schema(
  {
    amount: { 
      type: Number, 
      required: [true, 'Transaction amount is required'] 
    },
    currency: { 
      type: String, 
      default: 'EUR', 
      enum: ['EUR', 'BTC', 'ETH', 'USDT', 'ROI'] 
    },
    type: { 
      type: String, 
      enum: ['deposit', 'withdrawal', 'yield', 'investment', 'transfer', 'referral_bonus', 'override', 'compound'], 
      required: [true, 'Transaction type is required'] 
    },
    status: { 
      type: String, 
      enum: ['pending', 'completed', 'rejected', 'cancelled'], 
      default: 'pending' 
    },
    address: { type: String },
    description: { type: String },
    txHash: { type: String },           // optional: for crypto deposits
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const userSchema = mongoose.Schema(
  {
    name: { 
      type: String, 
      required: [true, 'Full name is required'], 
      trim: true 
    },
    username: { 
      type: String, 
      required: [true, 'Username is required'], 
      unique: true, 
      trim: true, 
      lowercase: true 
    },
    email: { 
      type: String, 
      required: [true, 'Email address is required'], 
      unique: true, 
      trim: true, 
      lowercase: true, 
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email'] 
    },
    phone: { 
      type: String, 
      required: [true, 'Phone number is required'] 
    },
    password: { 
      type: String, 
      required: [true, 'Password is required'], 
      minlength: 8, 
      select: false 
    },

    role: { 
      type: String, 
      enum: ['user', 'admin'], 
      default: 'user' 
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
    isBanned: { 
      type: Boolean, 
      default: false 
    },
    kycStatus: { 
      type: String, 
      enum: ['pending', 'verified', 'rejected', 'unsubmitted'], 
      default: 'unsubmitted' 
    },
    isNodeActive: { 
      type: Boolean, 
      default: false 
    },

    referralCode: { 
      type: String, 
      unique: true 
    },
    referredBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      default: null 
    },

    // === BTC DEPOSIT SYSTEM FIELDS ===
    btcDepositAddress: { 
      type: String, 
      default: null, 
      unique: true, 
      sparse: true 
    },
    lastBtcIndex: { 
      type: Number, 
      default: 100 
    },

    // Balances
    balances: {
      type: Map,
      of: Number,
      default: () => new Map([
        ['EUR', 0],
        ['ROI', 0],
        ['BTC', 0],
        ['ETH', 0],
        ['USDT', 0],
        ['INVESTED', 0],
        ['LOCKED', 0]
      ]),
    },

    totalBalance: { 
      type: Number, 
      default: 0 
    },
    totalProfit: { 
      type: Number, 
      default: 0 
    },
    realizedProfit: { 
      type: Number, 
      default: 0 
    },

    activePlan: { 
      type: String, 
      default: 'none' 
    },
    lastRoiAt: { 
      type: Date, 
      default: null 
    },

    resetPasswordToken: String,
    resetPasswordExpire: Date,

    ledger: [ledgerSchema],
  },
  {
    timestamps: true,
    toJSON: { 
      virtuals: true, 
      flattenMaps: true 
    },
    toObject: { 
      virtuals: true, 
      flattenMaps: true 
    },
  }
);

// Password Hashing Middleware
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Auto-generate Referral Code
userSchema.pre('save', async function (next) {
  if (this.isNew && !this.referralCode) {
    let isUnique = false;
    while (!isUnique) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      const existing = await this.constructor.findOne({ referralCode: code });
      if (!existing) {
        this.referralCode = code;
        isUnique = true;
      }
    }
  }
  next();
});

// Method to verify password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
