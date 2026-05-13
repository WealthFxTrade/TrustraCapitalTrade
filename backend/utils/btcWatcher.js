import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import axios from 'axios';
import { getAssetPriceEur } from './cryptoPrices.js';

const DUST_THRESHOLD = 0.00001;
const MIN_CONFIRMATIONS = 2;
const BATCH_SIZE = 5;

export const watchBtcDeposits = async (io) => {
  try {
    const users = await User.find({
      'walletAddresses.BTC': { $exists: true, $ne: '' },
      isActive: true,
      isBanned: false
    })
    .limit(BATCH_SIZE)
    .select('_id walletAddresses balances')
    .lean();

    if (!users.length) return;

    const btcPriceEur = await getAssetPriceEur('BTC');
    if (!btcPriceEur) return;

    for (const user of users) {
      await processUser(user, io, btcPriceEur);

      // prevent overload
      await new Promise(res => setTimeout(res, 1000));
    }

  } catch (err) {
    console.error('❌ BTC WATCHER ERROR:', err.message);
  }
};

const processUser = async (user, io, btcPriceEur) => {
  const address = user.walletAddresses.BTC;
  if (!address) return;

  try {
    const { data } = await axios.get(
      `https://blockchain.info/rawaddr/${address}?limit=5`,
      { timeout: 8000 }
    );

    if (!data?.txs) return;

    for (const tx of data.txs) {
      if (!tx.block_height) continue;

      const incoming = tx.out
        .filter(o => o.addr === address)
        .reduce((sum, o) => sum + (o.value || 0), 0);

      const btc = incoming / 1e8;
      if (btc < DUST_THRESHOLD) continue;

      const exists = await Transaction.findOne({ txHash: tx.hash });
      if (exists) continue;

      const eur = btc * btcPriceEur;

      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        {
          $inc: {
            'balances.BTC': btc,
            'balances.EUR': eur
          }
        },
        { new: true }
      );

      await Transaction.create({
        user: user._id,
        type: 'deposit',
        cryptoCurrency: 'BTC',
        cryptoAmount: btc,
        amount: eur,
        currency: 'EUR',
        status: 'completed',
        txHash: tx.hash
      });

      if (io && updatedUser) {
        io.to(user._id.toString()).emit('balanceUpdate', {
          balances: updatedUser.balances
        });
      }
    }

  } catch (err) {
    console.warn(`⚠️ BTC skip: ${address} - ${err.message}`);
  }
};
