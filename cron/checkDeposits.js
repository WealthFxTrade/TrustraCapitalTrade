import cron from 'node-cron';
import User from '../models/User.js';
import { getAddressUTXOs } from '../utils/bitcoin.js';

cron.schedule('*/5 * * * *', async () => { // every 5 minutes
  const users = await User.find({ btcAddress: { $ne: '' } });

  for (const user of users) {
    const utxos = await getAddressUTXOs(user.btcAddress);
    const balance = utxos.reduce((sum, utxo) => sum + utxo.value, 0) / 1e8; // BTC
    if (balance > user.balance) {
      console.log(`💰 ${user.fullName} deposited BTC: ${balance}`);
      user.balance = balance;
      await user.save();
    }
  }
});
