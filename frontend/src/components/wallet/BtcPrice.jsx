import React from 'react';
import { Bitcoin, TrendingUp } from 'lucide-react';

export default function BtcPrice({ price, error, className = '' }) {
  return (
    <div className={`glass-card p-6 flex items-center justify-between overflow-hidden relative group ${className}`}>
      {/* Background Icon Watermark */}
      <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
        <Bitcoin size={100} />
      </div>
      
      <div className="relative z-10">
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
          BTC / EUR Market
        </p>
        
        {error ? (
          <p className="text-red-400 text-[10px] font-bold uppercase">{error}</p>
        ) : (
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-black text-white font-mono tracking-tighter">
              {price ? `€${price.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '---'}
            </h3>
            <span className="text-[10px] font-bold text-emerald-500 flex items-center">
              <TrendingUp size={10} className="mr-0.5" /> LIVE
            </span>
          </div>
        )}
      </div>

      <div className="bg-orange-500/10 p-3 rounded-xl text-orange-500 relative z-10 border border-orange-500/20 shadow-lg shadow-orange-500/5">
        <Bitcoin size={24} />
      </div>
    </div>
  );
}

