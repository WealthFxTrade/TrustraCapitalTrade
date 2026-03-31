import React from 'react';

const PortfolioValue = ({ amount = 0 }) => {
  // Safe number conversion for Gery's €125,550.00
  const safeAmount = Number(amount) || 0;

  return (
    <div className="bg-gradient-to-br from-white/5 to-white/10 border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-lg shadow-2xl">
      <h3 className="text-xs font-black uppercase tracking-widest text-white/50 mb-4 font-mono">
        Institutional Node Valuation
      </h3>
      <div className="text-5xl lg:text-7xl font-black italic tracking-tighter text-white">
        €{safeAmount.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
      <div className="flex items-center gap-3 mt-4">
        <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Node Live
        </span>
        <p className="text-[10px] text-white/30 font-mono uppercase">
          Sync ID: 7bd35a1951e6
        </p>
      </div>
    </div>
  );
};

export default PortfolioValue;
