// backend/repair_gery.js
import mongoose from 'mongoose';

const MONGO_URI = "mongodb+srv://TrustraCapitalFx:Kayblizz2015@ac-kfwhzy7.w2mghdv.mongodb.net/TrustraCapitalTrade?retryWrites=true&w=majority";

const repairAccount = async () => {
  try {
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Database Connected Successfully');

    const { default: User } = await import('./models/User.js');

    const email = 'gery.maes1@telenet.be';

    console.log(`🧹 Removing old account...`);
    await User.deleteOne({ email });

    const gery = await User.create({
      name: 'Gery Maes',
      email: email,
      password: 'trustra2026',
      role: 'user',
      isActive: true,
      kycStatus: 'verified',
      address_index: 999,

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
        BTC: 'bc1q4epwlwdzxsst0xeevulxxazcxx5fs64eapxvq',
        ETH: '0x75B30257DabF3943FbE35e25c74ED637B2aAe1a3',
        USDT: '0x75B30257DabF3943FbE35e25c74ED637B2aAe1a3',
      }
    });

    console.log('\n✅ SUCCESS! GERY ACCOUNT CREATED');
    console.log(`📧 Email          : ${email}`);
    console.log(`🔑 Password       : trustra2026`);
    console.log(`💰 Available      : €${Number(gery.balances.EUR).toLocaleString('de-DE')}`);
    console.log(`📈 Invested       : €${Number(gery.balances.INVESTED).toLocaleString('de-DE')}`);
    console.log(`💵 Total Profit   : €${Number(gery.balances.TOTAL_PROFIT).toLocaleString('de-DE')}`);

    console.log('\n🔄 Now restart your backend server and login.');

  } catch (err) {
    console.error('❌ Failed:', err.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

repairAccount();
