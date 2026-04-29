import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import axios from 'axios';
import { getAssetPriceEur } from './cryptoPrices.js';
import pLimit from 'p-limit';

const DUST_THRESHOLD = 0.00001;
const MIN_CONFIRMATIONS = 2;
const limit = pLimit(3);

const isValidBtcAddress = (address) => {
  if (!address || typeof address !== 'string') return false;
  return /^(1|3|bc1)[a-zA-HJ-NP-Z0-9]{25,62}$/.test(address);
};

export const watchBtcDeposits = async (io) => {
  try {
    const users = await User.find({
      'walletAddresses.BTC': { $exists: true, $ne: '' },
      isActive: true,
      isBanned: false
    }).select('_id walletAddresses balances').lean();

    if (!users.length) return;

    const btcPriceEur = await getAssetPriceEur('BTC');
    if (!btcPriceEur) throw new Error("Could not fetch BTC price");

    await Promise.all(
      users.map(user =>
        limit(() => processBtcUser(user, io, btcPriceEur))
      )
    );

  } catch (err) {
    console.error('❌ [BTC_WATCHER_FATAL]', err.message);
  }
};

const processBtcUser = async (user, io, btcPriceEur) => {
  const address = user.walletAddresses.BTC;
  if (!isValidBtcAddress(address)) return;

  try {
    const { data } = await axios.get(
      `https://blockchain.info/rawaddr/${address}?limit=10`,
      { timeout: 10000 }
    );

    if (!data?.txs) return;

    for (const tx of data.txs) {

      // ✅ CONFIRMATION CHECK
      if (!tx.block_height) continue;

      const confirmations = data.n_tx - tx.tx_index; // fallback approximation
      if (confirmations < MIN_CONFIRMATIONS) continue;

      const incomingSats = tx.out
        .filter(o => o.addr === address)
        .reduce((sum, o) => sum + (o.value || 0), 0);

      const btcAmount = incomingSats / 1e8;
      if (btcAmount < DUST_THRESHOLD) continue;

      const existingTx = await Transaction.findOne({
        txHash: tx.hash,
        type: 'deposit'
      });

      if (existingTx) continue;

      const eurValue = btcAmount * btcPriceEur;

      const updatedUser = await User.findOneAndUpdate(
        { _id: user._id },
        {
          $inc: {
            'balances.BTC': Number(btcAmount.toFixed(8)),
            'balances.EUR': Number(eurValue.toFixed(2))
          }
        },
        { new: true }
      );

      await Transaction.create({
        user: user._id,
        type: 'deposit',
        cryptoCurrency: 'BTC',
        cryptoAmount: btcAmount,
        amount: Number(eurValue.toFixed(2)),
        currency: 'EUR',
        status: 'completed',
        method: 'onchain',
        walletAddress: address,
        txHash: tx.hash,
        description: `BTC Deposit Confirmed: ${btcAmount.toFixed(8)} BTC`,
        metadata: {
          source: 'btc_watcher_v4',
          confirmedAt: new Date()
        }
      });

      if (io && updatedUser) {
        io.to(user._id.toString()).emit('balanceUpdate', {
          balances: updatedUser.balances,
          message: `✅ BTC Confirmed: +${btcAmount.toFixed(8)} BTC`
        });
      }
    }

  } catch (e) {
    console.warn(`[BTC_WATCHER_SKIP] ${address} - ${e.message}`);
  }
};
