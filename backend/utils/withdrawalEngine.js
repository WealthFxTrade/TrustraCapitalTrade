import { ethers } from 'ethers';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import ApiError from './ApiError.js';

// ENV
const RPC = process.env.ETH_RPC_URL;
const MNEMONIC = process.env.ETH_MNEMONIC;

if (!RPC || !MNEMONIC) {
  throw new Error('Missing ETH config');
}

const provider = new ethers.JsonRpcProvider(RPC);
const wallet = ethers.Wallet.fromPhrase(MNEMONIC).connect(provider);

/**
 * =========================
 * SEND ETH (SAFE)
 * =========================
 */
const sendETH = async ({ to, amount }) => {
  try {
    const tx = await wallet.sendTransaction({
      to,
      value: ethers.parseEther(amount.toString()),
    });

    await tx.wait();

    console.log('✅ ETH SENT:', tx.hash);
    return tx.hash;

  } catch (err) {
    console.error('❌ ETH SEND FAILED:', err.message);
    throw new ApiError(500, 'ETH transfer failed');
  }
};

/**
 * =========================
 * SEND BTC (DISABLED SAFELY)
 * =========================
 */
const sendBTC = async () => {
  throw new ApiError(400, 'BTC withdrawals not enabled yet');
};

/**
 * =========================
 * MAIN ENGINE
 * =========================
 */
export const processWithdrawal = async (txId, io = null) => {
  const tx = await Transaction.findById(txId).populate('user');

  if (!tx) throw new ApiError(404, 'Transaction not found');

  if (tx.status !== 'pending') {
    throw new ApiError(400, 'Transaction already processed');
  }

  if (!tx.walletAddress) {
    throw new ApiError(400, 'Missing destination wallet');
  }

  const user = await User.findById(tx.user._id);

  if (!user) throw new ApiError(404, 'User not found');

  const currency = tx.currency.toUpperCase();
  const amount = Number(tx.amount);

  const walletBalance = user.balances.get(currency);

  if (!walletBalance) {
    throw new ApiError(400, 'Currency wallet not found');
  }

  if (walletBalance.locked < amount) {
    throw new ApiError(400, 'Insufficient locked balance');
  }

  let txHash;

  try {
    // =========================
    // SEND FUNDS
    // =========================
    if (currency === 'ETH') {
      txHash = await sendETH({
        to: tx.walletAddress,
        amount,
      });

    } else if (currency === 'BTC') {
      txHash = await sendBTC();

    } else {
      throw new ApiError(400, 'Unsupported currency');
    }

    // =========================
    // FINALIZE BALANCE
    // =========================
    walletBalance.locked -= amount;

    user.balances.set(currency, walletBalance);
    user.markModified('balances');

    // =========================
    // UPDATE TRANSACTION
    // =========================
    tx.status = 'completed';
    tx.txHash = txHash;

    await tx.save();
    await user.save();

    // =========================
    // SOCKET NOTIFICATION
    // =========================
    if (io) {
      io.to(user._id.toString()).emit('withdrawal:completed', {
        txId: tx._id,
        txHash,
      });
    }

    return tx;

  } catch (err) {
    console.error('[WITHDRAWAL ERROR]', err.message);

    // =========================
    // FAIL SAFE → RETURN FUNDS
    // =========================
    walletBalance.locked -= amount;
    walletBalance.available += amount;

    user.balances.set(currency, walletBalance);
    user.markModified('balances');

    tx.status = 'failed';

    await tx.save();
    await user.save();

    throw new ApiError(500, 'Withdrawal execution failed');
  }
};
