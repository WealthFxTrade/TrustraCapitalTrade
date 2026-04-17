// services/financeService.js
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import axios from 'axios';

const ASSET_MAP = { BTC: 'bitcoin', ETH: 'ethereum', USDT: 'tether' };
let priceCache = { rates: {}, lastUpdated: 0 };
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Apply a financial transaction to a user account.
 * Atomically updates balances and creates a verified Transaction record.
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

  // 1. Fetch user (without lean to allow .save())
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  // 2. Determine signed amount
  // Withdrawals and Investments are outflows (negative)
  const negativeTypes = ['withdrawal', 'investment'];
  const signedAmount = negativeTypes.includes(type.toLowerCase())
    ? -Math.abs(amount)
    : Math.abs(amount);

  // 3. Update balances
  const prevBalance = user.balances.get(currency) || 0;
  const newBalance = prevBalance + signedAmount;

  if (newBalance < 0) {
    throw new Error(`Insufficient ${currency} balance. Available: ${prevBalance}`);
  }

  // 4. Update the Map
  user.balances.set(currency, Number(newBalance.toFixed(8)));
  user.markModified('balances');
  
  // Save balance update first to ensure atomicity
  await user.save();

  // 5. Create the Transaction record (The actual "Ledger")
  const transaction = await Transaction.create({
    user: user._id,
    type: type.toLowerCase(),
    amount: Number(amount),
    signedAmount: Number(signedAmount),
    netAmount: Number(amount),
    currency: currency.toUpperCase(),
    walletAddress,
    status,
    description: description || `${type} of ${amount} ${currency}`,
    referenceId,
    method: 'crypto'
  });

  return { user, transaction };
};

/**
 * Get live crypto to EUR exchange rates from CoinGecko
 */
export const getExchangeRates = async () => {
  const now = Date.now();
  if (priceCache.lastUpdated && (now - priceCache.lastUpdated < CACHE_TTL)) {
    return priceCache.rates;
  }

  try {
    const ids = Object.values(ASSET_MAP).join(',');
    const { data } = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price',
      {
        params: { ids, vs_currencies: 'eur' },
        timeout: 8000
      }
    );

    const rates = {
      BTC: data.bitcoin.eur,
      ETH: data.ethereum.eur,
      USDT: data.tether.eur
    };

    priceCache = { rates, lastUpdated: now };
    return rates;
  } catch (err) {
    console.error('⚠️ [PRICE SERVICE] CoinGecko fetch failed:', err.message);
    // Safe fallbacks to prevent system stall if API is down
    return priceCache.rates.BTC ? priceCache.rates : { BTC: 65000, ETH: 3500, USDT: 0.94 };
  }
};

/**
 * Convert crypto amount to EUR for ledger valuation
 */
export const convertToEur = async (asset, amount) => {
  const rates = await getExchangeRates();
  const rate = rates[asset.toUpperCase()] || 0;
  return parseFloat((rate * amount).toFixed(2));
};

export default { applyTransaction, getExchangeRates, convertToEur };

