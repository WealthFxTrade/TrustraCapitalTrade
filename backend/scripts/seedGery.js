// scripts/seedGery.js
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config({ path: './.env.development' });

const seedGery = async () => {
  try {
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI missing");

    console.log("📡 Connecting to Vault Database...");

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Dynamic imports
    const { default: User } = await import('../models/User.js');

    const email = 'gery.maes1@telenet.be';

    // Clean previous user
    await User.deleteOne({ email });
    console.log(`⚠️ Cleared existing records for: ${email}`);

    // Get next derivation index
    const lastUser = await User.findOne().sort({ address_index: -1 });
    const nextIndex = lastUser && lastUser.address_index !== undefined
      ? lastUser.address_index + 1
      : 0;

    // Derive addresses
    const { deriveBtcAddress } = await import('../utils/bitcoinUtils.js');
    const { deriveEthAddress } = await import('../utils/ethUtils.js');

    const { address: btcAddress } = deriveBtcAddress(nextIndex);
    const { address: ethAddress } = deriveEthAddress(nextIndex);

    console.log(`🔑 Index \( {nextIndex} → BTC: \){btcAddress}`);
    console.log(`🔑 Index \( {nextIndex} → ETH: \){ethAddress}`);

    // Create user with exact balances
    const gery = await User.create({
      name: 'Gery Maes',
      email,
      password: 'trustra2026',
      role: 'user',
      isActive: true,
      kycStatus: 'verified',
      address_index: nextIndex,
      activePlan: 'Sovereign',

      // Use plain object (most stable with Mongoose)
      balances: {
        EUR: 85000,           // Available Balance
        INVESTED: 25000,      // Principal
        TOTAL_PROFIT: 15550,  // Accrued Profit
        BTC: 0.45,
        ETH: 2.15,
        USDT: 5000
      },

      walletAddresses: {
        BTC: btcAddress,
        ETH: ethAddress,
        USDT: ethAddress
      }
    });

    console.log("\n🚀 --- GERY PROVISIONED SUCCESSFULLY ---");
    console.log(`👤 User: ${gery.name}`);
    console.log(`📊 Total Capital : €125,550`);
    console.log(`💰 Available EUR : €${Number(gery.balances.EUR || 0).toLocaleString('de-DE')}`);
    console.log(`📈 Principal     : €${Number(gery.balances.INVESTED || 0).toLocaleString('de-DE')}`);
    console.log(`💵 Accrued Profit: €${Number(gery.balances.TOTAL_PROFIT || 0).toLocaleString('de-DE')}`);
    console.log(`🪙 BTC           : ${gery.balances.BTC}`);
    console.log(`🪙 ETH           : ${gery.balances.ETH}`);

    await mongoose.connection.close();
    console.log("✅ Database connection closed");
    process.exit(0);

  } catch (error) {
    console.error("\n❌ PROVISIONING FAILED:");
    console.error(error.message);
    if (mongoose.connection) await mongoose.connection.close();
    process.exit(1);
  }
};

seedGery();
