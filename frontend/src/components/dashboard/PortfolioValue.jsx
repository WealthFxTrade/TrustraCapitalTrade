// src/components/dashboard/PortfolioValue.jsx
import React from 'react';

const PortfolioValue = ({ value = 0 }) => {
  return (
    <div className="bg-gradient-to-br from-white/5 to-white/10 border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-lg shadow-2xl">
      <h3 className="text-xs font-black uppercase tracking-widest text-white/50 mb-4">
        Total Portfolio Value
      </h3>
      <div className="text-5xl lg:text-7xl font-black italic tracking-tighter text-white">
        €{value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
      <p className="text-sm text-white/40 mt-3">
        Updated in real-time • EUR equivalent
      </p>
    </div>
  );
};

export default PortfolioValue;
