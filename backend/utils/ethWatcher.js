import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { deriveEthAddress } from './ethUtils.js';
import { getAssetPriceEur } from './cryptoPrices.js';
import axios from 'axios';
import pLimit from 'p-limit';

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const limit = pLimit(3);

export const watchEthDeposits = async (io) => {
  try {
    const users = await User.find({
      address_index: { $exists: true, $ne: null },
      isActive: true,
      isBanned: false
    }).select('_id email address_index balances').lean();

    if (!users.length) return;

    const ethPriceEur = await getAssetPriceEur('ETH') || 0;

    await Promise.all(
      users.map(user =>
        limit(() => processUser(user, io, ethPriceEur))
      )
    );

  } catch (err) {
    console.error('⚠️ [ETH_WATCHER_FATAL]', err.message);
  }
};

const processUser = async (user, io, ethPriceEur) => {
  const { address } = deriveEthAddress(user.address_index);
  if (!address) return;

  try {
    const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${ETHERSCAN_API_KEY}`;

    const resp = await axios.get(url);

    if (resp.data.status !== '1' || !Array.isArray(resp.data.result)) return;

    for (const tx of resp.data.result) {
      if (!tx.to || tx.to.toLowerCase() !== address.toLowerCase()) continue;
      if (tx.isError === '1') continue;

      const ethAmount = parseFloat(tx.value) / 1e18;
      if (ethAmount < 0.0001) continue;

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
  } catch (e) {
    console.warn(`[ETH_WATCHER_SKIP] ${address} - ${e.message}`);
  }
};
