import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import mongoose from 'mongoose';

/**
 * Apply a financial transaction to a user account
 *
 * Supports: deposit, withdrawal, investment, reinvest, profit
 *
 * @param {Object} params
 * @param {mongoose.Types.ObjectId} params.userId - Target user
 * @param {string} params.type - 'deposit' | 'withdrawal' | 'investment' | 'profit' | 'reinvest'
 * @param {number} params.amount - Positive amount
 * @param {string} [params.currency='EUR'] - BTC, ETH, USDT, EUR, ROI
 * @param {string} [params.status='completed'] - pending/completed/rejected
 * @param {string} [params.walletAddress] - Crypto destination
 * @param {mongoose.Types.ObjectId} [params.referenceId] - Related deposit/investment ID
 */
export const applyTransaction = async ({
  userId,
  type,
  amount,
  currency = 'EUR',
  status = 'completed',
  walletAddress = null,
  referenceId = null,
  description = null
}) => {
  if (!userId || !type || amount <= 0) {
    throw new Error('Invalid transaction parameters');
  }

  // 1. Fetch user
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  // 2. Determine signed amount (negative for withdrawals/investments)
  let signedAmount = ['withdrawal', 'investment'].includes(type) ? -Math.abs(amount) : Math.abs(amount);

  // 3. Update balances map
  const prevBalance = user.balances.get(currency) || 0;
  const newBalance = prevBalance + signedAmount;

  if (newBalance < 0) throw new Error(`Insufficient ${currency} balance`);

  user.balances.set(currency, newBalance);

  // 4. Create ledger entry
  const ledgerEntry = {
    amount,
    type,
    currency,
    status,
    address: walletAddress,
    description: description || type,
    referenceId
  };

  user.ledger.push(ledgerEntry);

  user.markModified('balances');
  user.markModified('ledger');
  await user.save();

  // 5. Record in Transaction collection
  const tx = await Transaction.create({
    user: user._id,
    type,
    amount,
    signedAmount,
    netAmount: amount,
    currency,
    walletAddress,
    status,
    referenceId
  });

  return { user, ledgerEntry, transaction: tx };
};

/**
 * Convert crypto to EUR using live CoinGecko rates
 */
import axios from 'axios';

const ASSET_MAP = { BTC: 'bitcoin', ETH: 'ethereum', USDT: 'tether' };
let priceCache = { rates: {}, lastUpdated: 0 };
const CACHE_TTL = 5 * 60 * 1000; // 5 min

export const getExchangeRates = async () => {
  const now = Date.now();
  if (priceCache.lastUpdated && now - priceCache.lastUpdated < CACHE_TTL) return priceCache.rates;

  try {
    const ids = Object.values(ASSET_MAP).join(',');
    const { data } = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
      params: { ids, vs_currencies: 'eur' },
      timeout: 8000
    });

    const rates = {
      BTC: data.bitcoin.eur,
      ETH: data.ethereum.eur,
      USDT: data.tether.eur
    };

    priceCache = { rates, lastUpdated: now };
    return rates;
  } catch (err) {
    console.error('CoinGecko fetch failed', err.message);
    return priceCache.rates || { BTC: 42000, ETH: 2300, USDT: 0.93 };
  }
};

export const convertToEur = async (asset, amount) => {
  const rates = await getExchangeRates();
  return parseFloat(((rates[asset] || 0) * amount).toFixed(2));
};

export default { applyTransaction, getExchangeRates, convertToEur };
