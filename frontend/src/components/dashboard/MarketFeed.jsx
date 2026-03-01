import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, TrendingDown, Activity, Globe, RefreshCw } from 'lucide-react';

export default function MarketFeed() {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMarketData = async () => {
    try {
      const { data } = await axios.get(
        'https://api.coingecko.com/api/v3/coins/markets', {
          params: {
            vs_currency: 'eur',
            ids: 'bitcoin,ethereum,binancecoin,ripple,solana,cardano',
            order: 'market_cap_desc',
            sparkline: false
          }
        }
      );
      setCoins(data);
      setLoading(false);
    } catch (err) {
      console.error("Market Oracle Link Severed");
    }
  };

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#0a0f1e] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
      <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
        <div>
          <h2 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-3 text-white">
            <Globe className="text-yellow-500 animate-pulse" size={20} /> 
            Global <span className="text-yellow-500">Oversight</span>
          </h2>
          <p className="text-[9px] font-black uppercase text-gray-500 tracking-[0.4em] mt-1">Real-Time Asset Liquidity</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-black/40 border border-white/10 rounded-xl">
          <Activity size={12} className="text-emerald-500" />
          <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Live Feed</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-black/20 text-[9px] font-black uppercase tracking-[0.2em] text-gray-600">
            <tr>
              <th className="px-8 py-5">Asset</th>
              <th className="px-8 py-5">Price (EUR)</th>
              <th className="px-8 py-5">24H Change</th>
              <th className="px-8 py-5 text-right">Market Cap</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan="4" className="px-8 py-6 h-16 bg-white/[0.01]"></td>
                </tr>
              ))
            ) : (
              coins.map((coin) => (
                <tr key={coin.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <img src={coin.image} alt={coin.name} className="w-6 h-6 grayscale group-hover:grayscale-0 transition-all" />
                      <div>
                        <p className="text-xs font-black uppercase text-white tracking-tight">{coin.symbol}</p>
                        <p className="text-[9px] text-gray-600 font-bold uppercase">{coin.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 font-mono text-xs font-bold text-white">
                    €{coin.current_price.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-8 py-6">
                    <div className={`flex items-center gap-1 text-[10px] font-black italic ${coin.price_change_percentage_24h > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {coin.price_change_percentage_24h > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {coin.price_change_percentage_24h.toFixed(2)}%
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right font-mono text-[10px] text-gray-500">
                    €{(coin.market_cap / 1000000000).toFixed(2)}B
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 bg-black/40 text-center border-t border-white/5">
        <p className="text-[8px] text-gray-700 uppercase font-black tracking-[0.3em]">
          Data aggregated from Global Exchange Nodes • Precision 10⁻⁸
        </p>
      </div>
    </div>
  );
}
