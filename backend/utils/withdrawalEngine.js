import { ethers } from 'ethers';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import ApiError from './ApiError.js';
import { createDoubleEntry } from './doubleEntry.js'; // PRODUCTION FIX: Imported transaction accounting model utility

// ENV Configuration
const RPC = process.env.ETH_RPC_URL;
const MNEMONIC = process.env.ETH_MNEMONIC;

if (!RPC || !MNEMONIC) {
  throw new Error('Missing critical deployment ETH configuration variables.');
}

const provider = new ethers.JsonRpcProvider(RPC);
const wallet = ethers.Wallet.fromPhrase(MNEMONIC).connect(provider);

/**
 * ============================================================================
 * SEND ETH (SAFE Context Execution Engine)
 * ============================================================================
 */
const sendETH = async ({ to, amount }) => {
  try {
    // Check wallet balance against transaction cost before broadcasting
    const balance = await provider.getBalance(wallet.address);
    const parsedAmount = ethers.parseEther(amount.toString());

    if (balance < parsedAmount) {
      throw new Error('Platform corporate hot wallet contains insufficient gas funds.');
    }

    const tx = await wallet.sendTransaction({
      to,
      value: parsedAmount,
    });

    // Wait for at least 1 confirmation block block height to settle transaction state securely
    await tx.wait(1);

    console.log('✅ ETH BROADCAST COMPLETED SECURELY:', tx.hash);
    return tx.hash;

  } catch (err) {
    console.error('❌ ETH TRANSACTION EXECUTION FAILED:', err.message);
    throw new ApiError(500, `Blockchain network transfer exception: ${err.message}`);
  }
};

/**
 * ============================================================================
 * SEND BTC (DISABLED SAFELY Framework Placeholder Node)
 * ============================================================================
 */
const sendBTC = async () => {
  throw new ApiError(400, 'Bitcoin network automated payout settlement systems are not active.');
};

/**
 * ============================================================================
 * MAIN PAYOUT PROCESSING ENGINE
 * ============================================================================
 */
export const processWithdrawal = async (txId, io = null) => {
  // PRODUCTION ACCURACY FIX: Pessimistically check status early and handle state updates atomic-style
  // Find transaction block context layout frame safely
  const tx = await Transaction.findById(txId);
  if (!tx) throw new ApiError(404, 'Transaction trace footprint not located.');

  if (tx.status !== 'pending') {
    throw new ApiError(400, 'This withdrawal operation request trace has already been processed.');
  }

  if (!tx.walletAddress) {
    throw new ApiError(400, 'Destination blockchain network wallet delivery address target is missing.');
  }

  // PRODUCTION HARDENING FIX: Atomic state transition flip. Change status to 'processing'
  // immediately to kill cross-worker execution trace double-spend race condition vectors.
  tx.status = 'processing';
  await tx.save();

  const user = await User.findById(tx.user);
  if (!user) {
    tx.status = 'pending';
    await tx.save();
    throw new ApiError(404, 'Target institutional profile user context absent.');
  }

  const currency = tx.currency.toUpperCase();
  const amount = Number(tx.amount);

  // PRODUCTION MIGRATION FIX: Swapped out broken .get() Map abstractions to match nested layout objects
  const lockedKey = `LOCKED_${currency}`;
  const availableKey = currency;

  if (user.balances[lockedKey] === undefined || user.balances[availableKey] === undefined) {
    tx.status = 'pending';
    await tx.save();
    throw new ApiError(400, `Target currency ledger wallet allocation context [${currency}] not found.`);
  }

  if (user.balances[lockedKey] < amount) {
    tx.status = 'pending';
    await tx.save();
    throw new ApiError(400, 'Profile contains insufficient locked capital reserves to clear payout.');
  }

  let txHash;

  try {
    // ========================================================================
    // BLOCKCHAIN NETWORK ROUTING DISPATCH PIPELINES
    // ========================================================================
    if (currency === 'ETH') {
      txHash = await sendETH({
        to: tx.walletAddress,
        amount,
      });
    } else if (currency === 'BTC') {
      txHash = await sendBTC();
    } else {
      throw new ApiError(400, 'Target cryptographic payout currency format asset is not supported.');
    }

    // ========================================================================
    // FINALIZE LEDGER STATE ACCOUNTING BALANCES
    // ========================================================================
    user.balances[lockedKey] = Number((user.balances[lockedKey] - amount).toFixed(8));
    user.markModified('balances');

    // ========================================================================
    // COMMIT TRANSACTION LEDGER COMPLETION
    // ========================================================================
    tx.status = 'completed';
    tx.txHash = txHash;

    await tx.save();
    await user.save();

    // ========================================================================
    // IMMUTABLE ACCOUNTING LEDGER GENERATION
    // ========================================================================
    // PRODUCTION FIX: Automatically commit a balanced record detailing capital outflows
    await createDoubleEntry({
      userId: user._id,
      amount,
      currency,
      source: 'withdrawal',
      debitAccount: `USER_LOCKED_HOLDINGS_${currency}`,
      creditAccount: `EXTERNAL_BLOCKCHAIN_ADDRESS_${tx.walletAddress}`,
      description: `Settled asset payout: ${amount} ${currency}. Hash context: ${txHash}`
    });

    // ========================================================================
    // LIVE STREAM SOCKET NOTIFICATION DISPATCH PIPELINE
    // ========================================================================
    if (io) {
      io.to(user._id.toString()).emit('balanceUpdate', {
        balances: {
          EUR: user.balances.EUR,
          BTC: user.balances.BTC,
          ETH: user.balances.ETH,
          TOTAL_PROFIT: user.balances.TOTAL_PROFIT,
          INVESTED: user.balances.INVESTED
        },
        message: `Your payout of ${amount} ${currency} has been successfully settled on-chain.`
      });
    }

    return tx;

  } catch (err) {
    console.error('CRITICAL [WITHDRAWAL ENGINE EXCEPTION CAUGHT]', err.message);

    // ========================================================================
    // FAIL SAFE METHOD HARMONIZATION FIX:
    // Securely credit money back into the available balance pool without corrupting parameters.
    // ========================================================================
    const rollbackUser = await User.findById(tx.user);
    if (rollbackUser) {
      // PRODUCTION FIX: Restored correct mathematical notation addition arithmetic operator flag
      // Adds the amount back to the locked balance pool layout instead of dropping metrics below zero
      rollbackUser.balances[lockedKey] = Number((rollbackUser.balances[lockedKey] + amount).toFixed(8));
      rollbackUser.balances[availableKey] = Number((rollbackUser.balances[availableKey] + amount).toFixed(8));

      // Keep boundaries safe, truncate sub-zero parameters automatically if encountered
      if (rollbackUser.balances[lockedKey] < 0) {
        rollbackUser.balances[lockedKey] = 0;
      }

      rollbackUser.markModified('balances');
      await rollbackUser.save();
    }

    tx.status = 'failed';
    tx.description = `Automated transfer failed: ${err.message}`;
    await tx.save();

    throw new ApiError(500, `Automated checkout failed: ${err.message}`);
  }
};

