// scripts/seedGery.js
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// COMMENTED OUT FOR PRODUCTION OVERRIDES:
// dotenv.config({ path: './.env.development' });

const seedGery = async () => {
  try {
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI configuration parameter is missing from the environment context.");

    console.log("📡 Connecting to Vault Database...");

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB Atlas Cloud Cluster");

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

    // Derive addresses with safe cryptographic error handling fallbacks
    const { deriveBtcAddress } = await import('../utils/bitcoinUtils.js');
    const { deriveEthAddress } = await import('../utils/ethUtils.js');

    // Baseline fallbacks extracted directly from your production .env configurations and system memory logs
    let btcAddress = process.env.BTC_WALLET_ADDRESS || "bc1q4epwlwdzxsst0xeevulxxazcxx5fs64eapxvq";
    let ethAddress = "0x75B30257DabF3943FbE35e25c74ED637B2aAe1a3";

    try {
      const btcResult = deriveBtcAddress(nextIndex);
      if (btcResult && btcResult.address) {
        btcAddress = btcResult.address;
        console.log(`[BTC DERIVATION SUCCESS] Index ${nextIndex} → Address: ${btcAddress}`);
      }
    } catch (btcError) {
      console.warn(`⚠️ Warning: BTC derivation failed (${btcError.message}). Utilizing production backup configuration address.`);
    }

    try {
      const ethResult = deriveEthAddress(nextIndex);
      if (ethResult && ethResult.address) {
        ethAddress = ethResult.address;
        console.log(`[ETH DERIVATION SUCCESS] Index ${nextIndex} → Address: ${ethAddress}`);
      }
    } catch (ethError) {
      console.warn(`⚠️ Warning: Safe-trapped BIP-39 mnemonic validation failure (${ethError.message}). Utilizing fallback production proxy network layer address.`);
    }

    console.log(`🔑 Index Details -> Finalizing BTC Address Destination: ${btcAddress}`);
    console.log(`🔑 Index Details -> Finalizing ETH/USDT Address Destination: ${ethAddress}`);

    // Create user with exact institutional metrics
    const gery = await User.create({
      name: 'Gery Maes',
      email: email,
      password: 'trustra2026',
      role: 'user',
      isActive: true,
      kycStatus: 'verified',
      address_index: nextIndex,
      activePlan: 'Sovereign',

      // Stable plain object mapping layout for production Mongoose configurations
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

    console.log("\n🚀 --- GERY PROVISIONED SUCCESSFULLY ON PRODUCTION ---");
    console.log(`👤 User Name: ${gery.name}`);
    console.log(`📊 Account Hierarchy Context: Institutional Sovereign Profile`);
    console.log(`📊 Total Net Asset Valuation: €125,550`);
    console.log(`💰 Available Liquid EUR Cash Asset: €${Number(gery.balances.EUR || 0).toLocaleString('de-DE')}`);
    console.log(`📈 Principal Investment Allocation: €${Number(gery.balances.INVESTED || 0).toLocaleString('de-DE')}`);
    console.log(`💵 Accrued Platform System Yield: €${Number(gery.balances.TOTAL_PROFIT || 0).toLocaleString('de-DE')}`);
    console.log(`🪙 Sovereign BTC Balance Metric: ${gery.balances.BTC} BTC`);
    console.log(`🪙 Sovereign ETH Balance Metric: ${gery.balances.ETH} ETH`);
    console.log(`🪙 Tether Stablecoin Deposit Volume: ${gery.balances.USDT} USDT`);

    await mongoose.connection.close();
    console.log("✅ Database connectivity closed successfully.");
    process.exit(0);

  } catch (error) {
    console.error("\n❌ CRITICAL CRASH ENCOUNTERED DURING DATA PROVISIONING CYCLE:");
    console.error(error.message);
    if (mongoose.connection) {
      await mongoose.connection.close();
      console.log("🛑 Database network socket closed safely via exception terminal routine.");
    }
    process.exit(1);
  }
};

seedGery();

