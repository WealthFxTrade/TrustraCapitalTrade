import Deposit from '../models/Deposit.js';
import User from '../models/User.js';
import axios from 'axios';

/**
 * Checks the blockchain for deposits to known BTC addresses
 * and updates the deposit record + user balance automatically
 */
export async function checkBtcDeposits() {
  const pendingDeposits = await Deposit.find({ currency: 'BTC', status: 'pending' });

  for (const deposit of pendingDeposits) {
    const address = deposit.address;

    try {
      // Example using BlockCypher API (replace with your preferred provider)
      const res = await axios.get(`https://api.blockcypher.com/v1/btc/main/addrs/${address}/balance`);
      const confirmedSatoshis = res.data.final_balance;

      if (confirmedSatoshis > 0) {
        const btcAmount = confirmedSatoshis / 1e8;

        // Update deposit record
        deposit.amount = btcAmount;
        deposit.status = 'confirmed';
        deposit.confirmedAt = new Date();
        await deposit.save();

        // Update user balance atomically
        await User.findByIdAndUpdate(deposit.user, { $inc: { btcBalance: btcAmount } });

        console.log(`[BTC_DEPOSIT_CONFIRMED] User: ${deposit.user}, Address: ${address}, Amount: ${btcAmount} BTC`);
      }
    } catch (err) {
      console.error(`[BTC_DEPOSIT_CHECK_FAILED] Address: ${address}`, err.message);
    }
  }
}
