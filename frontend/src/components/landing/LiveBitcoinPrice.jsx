// src/components/landing/LiveBitcoinPrice.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, TrendingDown, RefreshCw, Activity } from 'lucide-react';

export default function LiveBitcoinPrice() {
  const [data, setData] = useState({
    price: 58933.00,
    change: 2.18,
    loading: true,
    error: false
  });

  const fetchPrice = async () => {
    try {
      const response = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price',
        {
          params: {
            ids: 'bitcoin',
            vs_currencies: 'eur',
            include_24hr_change: 'true'
          }
        }
      );

      if (response.data && response.data.bitcoin) {
        setData({
          price: response.data.bitcoin.eur,
          change: response.data.bitcoin.eur_24h_change,
          loading: false,
          error: false
        });
      }
    } catch (err) {
      console.error('[MARKET SYNC ERROR]:', err.message);
      // Keep existing price but flag the error
      setData(prev => ({ ...prev, loading: false, error: true }));
    }
  };

  useEffect(() => {
    fetchPrice();
    const interval = setInterval(fetchPrice, 60000); // 60s Sync
    return () => clearInterval(interval);
  }, []);

  if (data.loading) {
    return (
      <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-8 py-5 rounded-[2rem] animate-pulse">
        <RefreshCw className="text-emerald-500 animate-spin" size={20} />
        <div className="space-y-2">
          <div className="h-2 w-16 bg-white/10 rounded-full"></div>
          <div className="h-4 w-32 bg-white/10 rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-8 bg-white/5 border border-white/10 px-10 py-5 rounded-[2.5rem] hover:border-emerald-500/40 transition-all group backdrop-blur-sm">
      
      <div className="flex flex-col items-start">
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-500 mb-1.5">
          Bitcoin Node (EUR)
        </p>

        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-black tracking-tighter text-white">
            {data.price.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
          </span>

          <div className={`flex items-center gap-1 text-[11px] font-black uppercase ${
              data.change >= 0 ? 'text-emerald-500' : 'text-rose-500'
            }`}>
            {data.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {data.change >= 0 ? '+' : ''}{data.change.toFixed(2)}%
          </div>
        </div>

        {data.error && (
          <span className="text-[8px] font-black uppercase text-rose-500/70 mt-1 tracking-widest">
            Sync Delayed • Cache Data Active
          </span>
        )}
      </div>

      {/* Institutional Divider */}
      <div className="w-px h-12 bg-white/10 hidden md:block"></div>

      {/* Network Status Side */}
      <div className="hidden md:flex flex-col items-start">
        <div className="flex items-center gap-2 mb-1.5">
          <Activity size={12} className="text-emerald-500" />
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-500/70">
            Node Status
          </p>
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
          Global Pulse Live
        </span>
      </div>

    </div>
  );
}

