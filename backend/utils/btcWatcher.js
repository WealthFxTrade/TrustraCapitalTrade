import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import axios from 'axios';
import { getAssetPriceEur } from './cryptoPrices.js';

const DUST_THRESHOLD = 0.00001;
const MIN_CONFIRMATIONS = 2; // PRODUCTION SECURITY: Mandatory block confirmation height minimum threshold
const BATCH_SIZE = 10;

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

    // Fetch latest chain tip block height to evaluate confirmations accurately
    const blockCountResp = await axios.get('blockchain.info', { timeout: 5000 });
    const currentBlockHeight = parseInt(blockCountResp.data);

    if (isNaN(currentBlockHeight)) {
      console.warn('⚠️ [BTC_WATCHER] Unable to fetch blockchain network tip height. Skipping run.');
      return;
    }

    for (const user of users) {
      await processUser(user, io, btcPriceEur, currentBlockHeight);
      // Prevent network layer throttling overloads
      await new Promise(res => setTimeout(res, 1000));
    }

  } catch (err) {
    console.error('❌ BTC WATCHER FATAL EXCEPTION:', err.message);
  }
};

const processUser = async (user, io, btcPriceEur, currentBlockHeight) => {
  const address = user.walletAddresses.BTC;
  if (!address) return;

  try {
    // PRODUCTION FIX: Elevated limits from 5 to 50 to prevent entry truncation slips
    const { data } = await axios.get(
      `https://blockchain.info/rawaddr/${address}?limit=50`,
      { timeout: 8000 }
    );

    if (!data?.txs) return;

    for (const tx of data.txs) {
      if (!tx.block_height) continue;

      // PRODUCTION SECURITY FIX: Mitigate Replace-by-Fee (RBF) double spending attacks
      const confirmations = currentBlockHeight - tx.block_height + 1;
      if (confirmations < MIN_CONFIRMATIONS) {
        console.log(`⏳ [BTC_WATCHER] Transaction ${tx.hash} contains insufficient confirmations (${confirmations}/${MIN_CONFIRMATIONS}). Skipping.`);
        continue;
      }

      const incoming = tx.out
        .filter(o => o.addr === address)
        .reduce((sum, o) => sum + (o.value || 0), 0);

      const btc = incoming / 1e8;
      if (btc < DUST_THRESHOLD) continue;

      const exists = await Transaction.exists({ txHash: tx.hash });
      if (exists) continue;

      const eur = btc * btcPriceEur;

      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        {
          $inc: {
            'balances.BTC': Number(btc.toFixed(8)),
            'balances.EUR': Number(eur.toFixed(2))
          }
        },
        { new: true }
      );

      // PRODUCTION FIX: Standardized schema structural mapping values to match internal models
      await Transaction.create({
        user: user._id,
        type: 'deposit',
        amount: Number(btc.toFixed(8)),
        currency: 'BTC',
        status: 'completed',
        txHash: tx.hash,
        walletAddress: address,
        description: `BTC Deposit Confirmed: ${btc.toFixed(6)} BTC`
      });

      // Record a companion tracking record mapping fiat system metrics
      await Transaction.create({
        user: user._id,
        type: 'deposit',
        amount: Number(eur.toFixed(2)),
        currency: 'EUR',
        status: 'completed',
        txHash: `${tx.hash}-fiat`,
        walletAddress: address,
        description: `Value Allocation for BTC Deposit: €${eur.toFixed(2)}`
      });

      if (io && updatedUser) {
        io.to(user._id.toString()).emit('balanceUpdate', {
          balances: {
            EUR: updatedUser.balances.EUR,
            BTC: updatedUser.balances.BTC,
            ETH: updatedUser.balances.ETH,
            TOTAL_PROFIT: updatedUser.balances.TOTAL_PROFIT,
            INVESTED: updatedUser.balances.INVESTED
          },
          message: `✅ BTC Confirmed: +${btc.toFixed(6)} BTC`
        });
      }
    }

  } catch (err) {
    console.warn(`⚠️ BTC skip address entry processing: ${address} - ${err.message}`);
  }
};

