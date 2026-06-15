// scripts/seedGery.js
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Core system execution path anchor
const baseBackendPath = path.resolve(__dirname, '../');

// Proactively sweep across all project configuration targets
const targetFiles = [
  '.env.development',
  '.env.production',
  '.env'
];

let envLoaded = false;

for (const envFile of targetFiles) {
  const fullEnvPath = path.join(baseBackendPath, envFile);
  if (fs.existsSync(fullEnvPath)) {
    dotenv.config({ path: fullEnvPath });
    console.log(`📡 Connected environment profile layout: ${envFile}`);
    envLoaded = true;
    break;
  }
}

const seedGery = async () => {
  try {
    // Explicit runtime fallback resolution layer
    const connectionString = process.env.MONGO_URI || "mongodb+srv://TrustraCapitalFx:Kayblizz2015@ac-kfwhzy7.w2mghdv.mongodb.net/TrustraCapitalTrade?retryWrites=true&w=majority";

    if (!connectionString) {
      console.error('❌ MONGO_URI could not be read or recovered.');
      process.exit(1);
    }

    // Connect to target database container deployment
    await mongoose.connect(connectionString);
    console.log('✅ Connected safely to remote cluster engine');

    // Dynamically look up the default user model registration schema target
    const { default: User } = await import('../models/User.js');

    const email = 'gery.maes1@telenet.be';

    // Wipe previous target account matches to maintain accurate indices
    await User.deleteOne({ email });

    // Populate profile schema document matching the financial updates
    const gery = await User.create({
      name: 'Gery Maes',
      email,
      password: 'trustra2026',
      role: 'user',
      isActive: true,
      kycStatus: 'verified',

      balances: {
        EUR: 125550.75,
        BTC: 1.24567,
        ETH: 24.8765,
        USDT: 12500,

        INVESTED: 12500.00,
        TOTAL_PROFIT: 113050.75,

        LOCKED_EUR: 0,
        LOCKED_BTC: 0,
        LOCKED_ETH: 0,
        LOCKED_USDT: 0,
      },

      walletAddresses: {
        BTC:
          process.env.BTC_WALLET_ADDRESS ||
          'bc1q4epwlwdzxsst0xeevulxxazcxx5fs64eapxvq',
        ETH: '0x75B30257DabF3943FbE35e25c74ED637B2aAe1a3',
        USDT: '0x75B30257DabF3943FbE35e25c74ED637B2aAe1a3',
      },
    });

    // Format metrics console readouts
    console.log('\n🎉 GERY ACCOUNT SEEDED SUCCESSFULLY');
    console.log(`Email         : ${email}`);
    console.log(`Password      : trustra2026`);
    console.log(
      `Available     : €${Number(gery.balances.EUR).toLocaleString('de-DE', { minimumFractionDigits: 2 })}`
    );
    console.log(
      `Invested      : €${Number(gery.balances.INVESTED).toLocaleString('de-DE', { minimumFractionDigits: 2 })}`
    );
    console.log(
      `Total Profit  : €${Number(gery.balances.TOTAL_PROFIT).toLocaleString('de-DE', { minimumFractionDigits: 2 })}`
    );

  } catch (err) {
    console.error('❌ Data Seed Execution Rejection Failure:', err.message);
  } finally {
    // Terminate connection listener to release shell lock
    await mongoose.connection.close();
    process.exit(0);
  }
};

// Run entry loop logic
seedGery();
