import axios from 'axios';

let priceCache = {
  bitcoin: { eur: 0 },
  ethereum: { eur: 0 },
  tether: { eur: 0 },
  lastUpdated: 0
};

let currentFetchPromise = null;

const CACHE_DURATION = 5 * 60 * 1000;
const MAX_STALE_TIME = 30 * 60 * 1000;

const API_URL = 'https://api.coingecko.com/api/v3/simple/price';
const FALLBACK_API = 'https://min-api.cryptocompare.com/data/pricemulti';

const fetchWithRetry = async (fn, retries = 2) => {
  try {
    return await fn();
  } catch (err) {
    if (retries === 0) throw err;
    return fetchWithRetry(fn, retries - 1);
  }
};

export const getCryptoPrices = async () => {
  const now = Date.now();

  if (now - priceCache.lastUpdated < CACHE_DURATION && priceCache.bitcoin?.eur > 0) {
    return priceCache;
  }

  if (currentFetchPromise) return currentFetchPromise;

  currentFetchPromise = (async () => {
    try {
      const { data } = await fetchWithRetry(() =>
        axios.get(API_URL, {
          params: {
            ids: 'bitcoin,ethereum,tether',
            vs_currencies: 'eur'
          },
          timeout: 8000
        })
      );

      if (data?.bitcoin && data?.ethereum && data?.tether) {
        priceCache = {
          bitcoin: data.bitcoin,
          ethereum: data.ethereum,
          tether: data.tether,
          lastUpdated: Date.now()
        };

        console.log('📊 [PRICE API] Updated from CoinGecko');
        return priceCache;
      }

      throw new Error('Invalid response');

    } catch (error) {
      console.warn('⚠️ Primary API failed, trying fallback...');

      try {
        const { data } = await axios.get(FALLBACK_API, {
          params: {
            fsyms: 'BTC,ETH,USDT',
            tsyms: 'EUR'
          },
          timeout: 8000
        });

        priceCache = {
          bitcoin: { eur: data.BTC?.EUR || 0 },
          ethereum: { eur: data.ETH?.EUR || 0 },
          tether: { eur: data.USDT?.EUR || 0 },
          lastUpdated: Date.now()
        };

        console.log('🔁 [PRICE API] Fallback used');
        return priceCache;

      } catch {
        const isTooStale = Date.now() - priceCache.lastUpdated > MAX_STALE_TIME;

        if (isTooStale) {
          console.error('❌ Cache too stale, returning zero prices');
          return {
            bitcoin: { eur: 0 },
            ethereum: { eur: 0 },
            tether: { eur: 0 },
            lastUpdated: 0
          };
        }

        console.warn('⚠️ Using stale cache');
        return priceCache;
      }
    } finally {
      currentFetchPromise = null;
    }
  })();

  return currentFetchPromise;
};

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
