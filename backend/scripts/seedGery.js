import dotenv from 'dotenv';
import mongoose from 'mongoose';

// 1. Load the environment immediately
dotenv.config({ path: './.env.development' });

// 2. Wrap everything in an async function to use dynamic imports
const seedGery = async () => {
  try {
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI missing");
    if (!process.env.ETH_MNEMONIC) throw new Error("ETH_MNEMONIC missing");

    // 3. Dynamically import utilities AFTER env is loaded
    const { deriveBtcAddress } = await import('../utils/bitcoinUtils.js');
    const { deriveEthAddress } = await import('../utils/ethUtils.js');
    const { default: User } = await import('../models/User.js');

    console.log("📡 Connecting to Vault Database...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const email = 'gery.maes1@telenet.be';
    await User.deleteOne({ email });
    console.log(`⚠️ Cleared existing records for: ${email}`);

    const lastUser = await User.findOne().sort({ address_index: -1 });
    const nextIndex = lastUser && lastUser.address_index !== undefined ? lastUser.address_index + 1 : 0;

    // 4. Derive Addresses (Will now find the MNEMONIC)
    const { address: btcAddress } = deriveBtcAddress(nextIndex);
    const { address: ethAddress } = deriveEthAddress(nextIndex);
    
    console.log(`🔑 Index ${nextIndex} -> BTC: ${btcAddress}`);
    console.log(`🔑 Index ${nextIndex} -> ETH: ${ethAddress}`);

    // 5. Create Gery
    const gery = await User.create({
      name: 'Gery Maes',
      email: email,
      password: 'trustra2026',
      role: 'user',
      isActive: true,
      kycStatus: 'verified',
      address_index: nextIndex,
      activePlan: 'Sovereign',
      balances: new Map([
        ['EUR', 125550],
        ['BTC', 0.45],
        ['ETH', 0],
        ['USDT', 5000],
        ['TOTAL_PROFIT', 12.5], 
        ['INVESTED', 110000]
      ]),
      walletAddresses: new Map([
        ['BTC', btcAddress],
        ['ETH', ethAddress],
        ['USDT', ethAddress]
      ])
    });

    console.log("\n🚀 --- GERY PROVISIONED SUCCESSFULLY ---");
    console.log(`👤 User: ${gery.name}`);
    console.log(`📊 Principal: €${gery.balances.get('INVESTED').toLocaleString()}`);
    
    process.exit(0);
  } catch (error) {
    console.error("\n❌ PROVISIONING FAILED:");
    console.error(error.message);
    process.exit(1);
  }
};

seedGery();

