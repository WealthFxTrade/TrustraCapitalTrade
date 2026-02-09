import api from "./apiService";

/**
 * Fetch Bitcoin price from backend
 * Endpoint: GET /api/market/btc
 */
export const fetchBTCPrice = async () => {
  try {
    const res = await api.get("/market/btc");
    return res.data.price; // Backend should respond { price: <number> }
  } catch (err) {
    console.error("⚠️ BTC Fetch Error:", err.message);
    return null;
  }
};

/**
 * Fetch all market data (optional, extendable)
 * Endpoint: GET /api/market
 */
export const fetchMarketData = async () => {
  try {
    const res = await api.get("/market");
    return res.data;
  } catch (err) {
    console.error("⚠️ Market Data Fetch Error:", err.message);
    return null;
  }
};
