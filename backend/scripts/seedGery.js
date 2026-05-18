// scripts/seedGery.js
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const seedGery = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('❌ MONGO_URI not found');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Database Connected');

    const { default: User } = await import('../models/User.js');

    const email = 'gery.maes1@telenet.be';

    await User.deleteOne({ email });

    const gery = await User.create({
      name: 'Gery Maes',
      email: email,
      password: 'trustra2026',
      role: 'user',
      isActive: true,
      kycStatus: 'verified',

      balances: {
        EUR: 125550.75,
        BTC: 1.24567,
        ETH: 24.8765,
        USDT: 12500,
        INVESTED: 85000.00,
        TOTAL_PROFIT: 40550.75,
        LOCKED_EUR: 0,
        LOCKED_BTC: 0,
        LOCKED_ETH: 0,
        LOCKED_USDT: 0,
      },

      walletAddresses: {
        BTC: process.env.BTC_WALLET_ADDRESS || 'bc1q4epwlwdzxsst0xeevulxxazcxx5fs64eapxvq',
        ETH: '0x75B30257DabF3943FbE35e25c74ED637B2aAe1a3',
        USDT: '0x75B30257DabF3943FbE35e25c74ED637B2aAe1a3',
      }
    });

    console.log('\n🎉 GERY ACCOUNT SEEDED SUCCESSFULLY');
    console.log(`Email         : ${email}`);
    console.log(`Password      : trustra2026`);
    console.log(`Available     : €${Number(gery.balances.EUR).toLocaleString('de-DE')}`);
    console.log(`Invested      : €${Number(gery.balances.INVESTED).toLocaleString('de-DE')}`);
    console.log(`Total Profit  : €${Number(gery.balances.TOTAL_PROFIT).toLocaleString('de-DE')}`);

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

seedGery();
