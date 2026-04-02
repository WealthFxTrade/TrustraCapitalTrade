// backend/repair_gery.js
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import User from './models/User.js';

const repairAccount = async () => {
  try {
    await connectDB();
    const email = 'gery.maes1@telenet.be';

    console.log(`🧹 [CLEANUP] Removing existing node for: ${email}`);
    await User.deleteOne({ email });

    console.log(`🏗️ [REBUILD] Creating fresh Principal Node...`);
    const gery = await User.create({
      name: 'Gery Maes',
      email: email,
      password: 'trustra2026', // This will be hashed automatically by your User model
      role: 'user',
      isActive: true,
      kycStatus: 'verified',
      balances: {
        EUR: 125550.00,
        ROI: 0.00,
        BTC: 0.00,
        USDT: 0.00
      }
    });

    console.log('✅ [SUCCESS] Gery Maes Account Restored!');
    console.log(`🔑 Login: ${email} | Password: trustra2026`);
    console.log(`💰 Balance: €${gery.balances.get('EUR').toLocaleString('de-DE')}`);

  } catch (err) {
    console.error('🔥 [REPAIR FAILED]:', err.message);
  } finally {
    await mongoose.connection.close();
    process.exit();
  }
};

repairAccount();
