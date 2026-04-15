// scripts/migrateWalletAddresses.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config({ path: '.env.development' });   // or '.env' depending on your setup

const migrateWalletAddresses = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB for migration');

    // Find users who still have old address fields in balances
    const users = await User.find({
      $or: [
        { 'balances.BTC_ADDRESS': { $exists: true, $ne: '' } },
        { 'balances.ETH_ADDRESS': { $exists: true, $ne: '' } }
      ]
    });

    console.log(`🔍 Found ${users.length} users needing migration...`);

    for (const user of users) {
      let migrated = false;

      // Migrate BTC
      const oldBtc = user.balances.get('BTC_ADDRESS');
      if (oldBtc && oldBtc.length > 10) {
        user.walletAddresses.set('BTC', oldBtc);
        user.balances.delete('BTC_ADDRESS');
        migrated = true;
        console.log(`→ Migrated BTC address for ${user.email || user._id}`);
      }

      // Migrate ETH (if exists)
      const oldEth = user.balances.get('ETH_ADDRESS');
      if (oldEth && oldEth.length > 10) {
        user.walletAddresses.set('ETH', oldEth);
        user.balances.delete('ETH_ADDRESS');
        migrated = true;
        console.log(`→ Migrated ETH address for ${user.email || user._id}`);
      }

      if (migrated) {
        await user.save();
        console.log(`✅ Migration saved for user ${user.email || user._id}`);
      }
    }

    console.log('🎉 Wallet addresses migration completed!');
  } catch (err) {
    console.error('❌ Migration error:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

migrateWalletAddresses();
