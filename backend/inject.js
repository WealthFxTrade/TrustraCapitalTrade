// backend/inject.js
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import User from './models/User.js';

const injectFunds = async () => {
  try {
    // 1. Establish the Ledger Connection
    await connectDB();

    const email = 'gery.maes1@telenet.be';
    console.log(`📡 [INJECTOR] Targeting Principal: ${email}`);

    // 2. Perform the Capital Allocation
    const updatedUser = await User.findOneAndUpdate(
      { email: email },
      { 
        $set: { 
          'balances.EUR': 125550.00,
          'balances.ROI': 0.00,
          'isActive': true,
          'kycStatus': 'verified'
        } 
      },
      { new: true, upsert: false }
    );

    if (updatedUser) {
      console.log('✅ [SUCCESS] Portfolio Synchronized!');
      console.log(`💰 New Balance: €${updatedUser.balances.get('EUR').toLocaleString('de-DE')}`);
    } else {
      console.error('❌ [FAILURE] User not found. Did you bootstrap the account first?');
    }

  } catch (err) {
    console.error('🔥 [CRITICAL ERROR]:', err.message);
  } finally {
    await mongoose.connection.close();
    process.exit();
  }
};

injectFunds();
