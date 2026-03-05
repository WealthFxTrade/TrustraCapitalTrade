import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    totalBalance: { type: Number, default: 0 },
    totalProfit: { type: Number, default: 0 },
    activePlan: { type: String, default: 'none' },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    isBanned: { type: Boolean, default: false },
    role: { type: String, default: 'user' },
    
    // 🛡️ IDEMPOTENCY GUARD
    lastRoiAt: { type: Date, default: null },

    // 💰 MULTI-CURRENCY LEDGER
    balances: {
        type: Map,
        of: Number,
        default: { 'EUR': 0, 'ROI': 0, 'COMMISSION': 0 }
    },

    // 📜 TRANSACTION HISTORY
    ledger: [{
        amount: Number,
        currency: String,
        type: { type: String, enum: ['deposit', 'withdrawal', 'yield', 'referral'] },
        status: { type: String, default: 'pending' },
        description: String,
        createdAt: { type: Date, default: Date.now }
    }],

    referralCode: { type: String },
    referredBy: { type: String, default: null }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
