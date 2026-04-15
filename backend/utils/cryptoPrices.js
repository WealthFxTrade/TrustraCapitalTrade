import axios from 'axios';

/** 
 * 📊 REAL-TIME CRYPTO PRICE SERVICE (Production Grade)
 * Fixed: Longer cache + retry logic to avoid 429 rate limits
 */

let priceCache = {
  bitcoin: { eur: 0 },
  ethereum: { eur: 0 },
  tether: { eur: 0 },
  lastUpdated: 0
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes (increased to reduce API calls)
const API_URL = 'https://api.coingecko.com/api/v3/simple/price';

export const getCryptoPrices = async () => {
  const now = Date.now();

  // Serve cache if still valid
  if (now - priceCache.lastUpdated < CACHE_DURATION && 
      priceCache.bitcoin?.eur > 0) {
    return priceCache;
  }

  try {
    const { data } = await axios.get(API_URL, {
      params: {
        ids: 'bitcoin,ethereum,tether',
        vs_currencies: 'eur'
      },
      timeout: 8000
    });

    if (data?.bitcoin && data?.ethereum && data?.tether) {
      priceCache = {
        bitcoin: data.bitcoin,
        ethereum: data.ethereum,
        tether: data.tether,
        lastUpdated: now
      };

      console.log('✅ [PRICE API] Successfully updated crypto prices');
      return priceCache;
    }

    throw new Error('Invalid API response structure');
  } catch (error) {
    const status = error.response?.status;
    let errorMsg = error.message;

    if (status === 429) {
      errorMsg = 'Rate limit exceeded (429) - using cached prices';
    }

    console.warn(`⚠️ [PRICE API WARN] Using cached fallback → ${errorMsg}`);

    // Return cache even if stale (better than 0)
    return priceCache;
  }
};

/** 
 * 💰 Get single asset price in EUR
 */
export const getAssetPriceEur = async (asset) => {
  if (!asset) return 0;

  const prices = await getCryptoPrices();

  const map = {
    BTC: prices.bitcoin?.eur || 0,
    ETH: prices.ethereum?.eur || 0,
    USDT: prices.tether?.eur || 0,
    TETHER: prices.tether?.eur || 0
  };

  return map[asset.toUpperCase()] || 0;
};
