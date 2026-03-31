import axios from 'axios';

export const getLivePrices = async (symbols = ['BTC', 'ETH', 'EUR']) => {
  const prices = { BTC: 0, ETH: 0, EUR: 1 };

  try {
    const res = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
      params: { ids: 'bitcoin,ethereum', vs_currencies: 'eur' },
    });
    prices.BTC = res.data.bitcoin.eur;
    prices.ETH = res.data.ethereum.eur;
  } catch (error) {
    console.error('[PRICE FETCH ERROR]', error.message);
  }

  return prices;
};
