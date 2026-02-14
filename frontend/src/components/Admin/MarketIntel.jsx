import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, TrendingDown, Globe } from 'lucide-react';

export default function MarketIntel({ totalBtc, totalEth }) {
  const [prices, setPrices] = useState({ btc: 0, eth: 0, change: 0 });

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const res = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=eur&include_24hr_change=true');
        setPrices({
          btc: res.data.bitcoin.eur,
          eth: res.data.ethereum.eur,
          change: res.data.bitcoin.eur_24h_change
        });
      } catch (err) {
        console.error("Oracle offline");
      }
    };
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Market Oracle Card */}
      <div className="bg-gradient-to-br from-[#10141d] to-[#07090e] border border-white/5 p-6 rounded-[2rem] shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Globe className="text-indigo-500 animate-pulse" size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Live Market Oracle</span>
          </div>
          <span className={`text-[10px] font-bold ${prices.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {prices.change >= 0 ? '+' : ''}{prices.change?.toFixed(2)}% (24h)
          </span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-black font-mono tracking-tighter">€{prices.btc?.toLocaleString()}</p>
            <p className="text-[9px] font-bold text-gray-600 uppercase mt-1">Bitcoin / Euro Spot</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-black text-gray-400">€{prices.eth?.toLocaleString()}</p>
            <p className="text-[9px] font-bold text-gray-600 uppercase">Ethereum Spot</p>
          </div>
        </div>
      </div>

      {/* Platform Solvency Card */}
      <div className="bg-[#0f121d] border border-white/5 p-6 rounded-[2rem] flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="text-emerald-500" size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Asset Valuation</span>
        </div>
        <h2 className="text-3xl font-black text-white">
          €{((totalBtc * prices.btc) + (totalEth * prices.eth)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </h2>
        <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest mt-1">Combined Portfolio Value (Live)</p>
      </div>
    </div>
  );
}
