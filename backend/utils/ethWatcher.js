import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { deriveEthAddress } from './ethUtils.js';
import { getAssetPriceEur } from './cryptoPrices.js';
import axios from 'axios';
import pLimit from 'p-limit';

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const MIN_ETH_CONFIRMATIONS = 6; // PRODUCTION SECURITY STANDARD: 6 blocks for institutional confirmation safety
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

    // Fetch current canonical block height from proxy gateway
    const blockHeightUrl = `etherscan.io{ETHERSCAN_API_KEY}`;
    const heightResp = await axios.get(blockHeightUrl, { timeout: 5000 });
    const currentHexBlock = heightResp.data?.result;

    if (!currentHexBlock) {
      console.warn('⚠️ [ETH_WATCHER] Unable to read network block context tip. Postponing job loop.');
      return;
    }
    const currentBlockHeight = parseInt(currentHexBlock, 16);

    await Promise.all(
      users.map(user =>
        limit(() => processUser(user, io, ethPriceEur, currentBlockHeight))
      )
    );

  } catch (err) {
    console.error('⚠️ [ETH_WATCHER_FATAL_EXCEPTION]', err.message);
  }
};

const processUser = async (user, io, ethPriceEur, currentBlockHeight) => {
  const { address } = deriveEthAddress(user.address_index);
  if (!address) return;

  try {
    const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${ETHERSCAN_API_KEY}`;
    const resp = await axios.get(url, { timeout: 10000 });

    if (resp.data.status !== '1' || !Array.isArray(resp.data.result)) return;

    for (const tx of resp.data.result) {
      if (!tx.to || tx.to.toLowerCase() !== address.toLowerCase()) continue;
      if (tx.isError === '1') continue;

      // PRODUCTION SECURITY FIX: Prevent zero-confirmation mempool injection exploits
      const txBlock = parseInt(tx.blockNumber);
      if (isNaN(txBlock)) continue;

      const confirmations = currentBlockHeight - txBlock + 1;
      if (confirmations < MIN_ETH_CONFIRMATIONS) {
        console.log(`⏳ [ETH_WATCHER] Tx ${tx.hash} pending block maturity confirmations (${confirmations}/${MIN_ETH_CONFIRMATIONS}).`);
        continue;
      }

      const ethAmount = parseFloat(tx.value) / 1e18;
      if (ethAmount < 0.0001) continue;

      const existingTx = await Transaction.exists({ txHash: tx.hash });
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

      if (!updatedUser) continue;

      // Primary token ledger entry tracking
      await Transaction.create({
        user: user._id,
        type: 'deposit',
        amount: Number(ethAmount.toFixed(8)),
        currency: 'ETH',
        status: 'completed',
        walletAddress: address,
        txHash: tx.hash,
        description: `ETH Deposit Confirmed: ${ethAmount.toFixed(6)} ETH`
      });

      // Unified companion record capturing fiat valuations
      await Transaction.create({
        user: user._id,
        type: 'deposit',
        amount: Number(eurValue.toFixed(2)),
        currency: 'EUR',
        status: 'completed',
        walletAddress: address,
        txHash: `${tx.hash}-fiat`,
        description: `Value Allocation for ETH Deposit: €${eurValue.toFixed(2)}`
      });

      if (io) {
        io.to(user._id.toString()).emit('balanceUpdate', {
          balances: {
            EUR: updatedUser.balances.EUR,
            BTC: updatedUser.balances.BTC,
            ETH: updatedUser.balances.ETH,
            TOTAL_PROFIT: updatedUser.balances.TOTAL_PROFIT,
            INVESTED: updatedUser.balances.INVESTED
          },
          message: `✅ ETH Confirmed: +${ethAmount.toFixed(6)} ETH`
        });
      }
    }
  } catch (e) {
    console.warn(`[ETH_WATCHER_SKIP] Skipped runtime profile for ${address} - ${e.message}`);
  }
};

