import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { deriveEthAddress } from './ethUtils.js';
import { getAssetPriceEur } from './cryptoPrices.js';
import axios from 'axios';

// Replace with your Etherscan API Key for production reliability
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

export const watchEthDeposits = async (io) => {
  try {
    const users = await User.find({
      address_index: { $exists: true, $ne: null },
      isActive: true,
      isBanned: false
    }).select('_id email address_index balances').lean();

    if (!users.length) return;

    const ethPriceEur = await getAssetPriceEur('ETH') || 0;
    const usdtPriceEur = await getAssetPriceEur('USDT') || 0.93;

    for (const user of users) {
      const { address } = deriveEthAddress(user.address_index);
      if (!address) continue;

      try {
        // Fetch recent Transactions for this specific address
        // Using Etherscan API is the production standard for "Watcher" scripts
        const url = `https://etherscan.io{address}&startblock=0&endblock=99999999&sort=desc&apikey=${ETHERSCAN_API_KEY}`;
        const resp = await axios.get(url);
        
        if (resp.data.status !== '1' || !resp.data.result) continue;

        for (const tx of resp.data.result) {
          // Only process incoming transactions
          if (tx.to.toLowerCase() !== address.toLowerCase()) continue;
          if (tx.isError === '1') continue;

          const ethAmount = parseFloat(tx.value) / 1e18;
          if (ethAmount < 0.001) continue;

          // Idempotency check via TX Hash
          const existingTx = await Transaction.findOne({ txHash: tx.hash });
          if (existingTx) continue;

          const eurValue = ethAmount * ethPriceEur;

          const updatedUser = await User.findOneAndUpdate(
            { _id: user._id },
            {
              $inc: {
                'balances.ETH': Number(ethAmount.toFixed(8)),
                'balances.EUR': Number(eurValue.toFixed(2))
              }
            },
            { new: true }
          );

          await Transaction.create({
            user: user._id,
            type: 'deposit',
            cryptoCurrency: 'ETH',
            cryptoAmount: ethAmount,
            amount: Number(eurValue.toFixed(2)),
            currency: 'EUR',
            status: 'completed',
            walletAddress: address,
            txHash: tx.hash,
            description: `ETH Deposit: ${ethAmount.toFixed(6)} ETH`
          });

          if (io && updatedUser) {
            io.to(user._id.toString()).emit('balanceUpdate', {
              balances: updatedUser.balances,
              message: `✅ ETH Confirmed: +${ethAmount.toFixed(6)} ETH`
            });
          }
        }
      } catch (e) { /* Skip address error */ }
    }
  } catch (err) {
    console.error('⚠️ [ETH_WATCHER_FATAL]', err.message);
  }
};

