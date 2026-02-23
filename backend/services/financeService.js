import axios from 'axios';

/**
 * Trustra Capital Trade - Finance Service (Rio Series 2026)
 * Handles real-time price fetching and currency conversions.
 */

// Asset Mapping (App Symbol -> CoinGecko ID)
const ASSET_MAP = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  USDT: 'tether'
};

// Internal Cache Settings
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
let priceCache = {
  rates: { BTC: 0, ETH: 0, USDT: 0 },
  lastUpdated: 0
};

/**
 * Fetches the latest EUR exchange rates from CoinGecko.
 * @returns {Promise<Object>} Object containing BTC, ETH, and USDT prices in EUR.
 */
export const getExchangeRates = async () => {
  const now = Date.now();

  // 1. Return cached rates if they are fresh
  if (priceCache.lastUpdated && (now - priceCache.lastUpdated < CACHE_TTL)) {
    return priceCache.rates;
  }

  try {
    const ids = Object.values(ASSET_MAP).join(',');
    
    // 2. Fetch from CoinGecko Simple Price API
    const { data } = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
      params: {
        ids: ids,
        vs_currencies: 'eur'
      }
    });

    // 3. Format and update cache
    const newRates = {
      BTC: data.bitcoin.eur,
      ETH: data.ethereum.eur,
      USDT: data.tether.eur
    };

    priceCache = {
      rates: newRates,
      lastUpdated: now
    };

    return newRates;

  } catch (error) {
    console.error(`[FinanceService] Sync Failed: ${error.message}`);
    
    // 4. Fallback Strategy: Return last known cache or safe defaults
    if (priceCache.lastUpdated) return priceCache.rates;
    
    return { BTC: 42000, ETH: 2300, USDT: 0.93 }; // Safe static defaults for 2026
  }
};

/**
 * Converts a crypto amount into its EUR equivalent.
 * @param {string} asset - BTC, ETH, or USDT.
 * @param {number} amount - The amount of crypto.
 * @returns {Promise<number>} - Fixed 2-decimal EUR value.
 */
export const convertToEur = async (asset, amount) => {
  const rates = await getExchangeRates();
  const rate = rates[asset] || 0;
  return parseFloat((amount * rate).toFixed(2));
};

export default {
  getExchangeRates,
  convertToEur
};

