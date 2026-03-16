// src/components/dashboard/AssetCard.jsx
import React from 'react';

const AssetCard = ({ label, value = 0, price = 0, icon, symbol = '' }) => {
  // Format value: more decimals for crypto, 2 for fiat
  const formattedValue = symbol === 'EUR'
    ? value.toFixed(2)
    : value.toFixed(6);

  // Format price with commas
  const formattedPrice = price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // Simple placeholder for % change (you can make dynamic later)
  const changePercent = (Math.random() * 10 - 5).toFixed(2); // dummy -5% to +5%
  const isPositive = changePercent >= 0;

  return (
    <div 
      className="
        bg-gradient-to-br from-white/5 to-black/30 
        border border-white/10 rounded-[2rem] 
        p-6 backdrop-blur-lg shadow-xl shadow-black/40 
        hover:border-white/30 hover:shadow-2xl 
        transition-all duration-300 group
      "
    >
      {/* Header: Icon + Label + Symbol */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white/90 group-hover:scale-110 transition-transform">
            {icon}
          </div>
          <div>
            <h4 className="text-lg font-black uppercase tracking-wide text-white">
              {label}
            </h4>
            <p className="text-xs font-mono text-white/50">{symbol}</p>
          </div>
        </div>

        {/* Change indicator (placeholder) */}
        {price > 0 && (
          <span 
            className={`
              text-xs font-bold px-3 py-1.5 rounded-full 
              ${isPositive 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : 'bg-red-500/20 text-red-400 border border-red-500/30'}
            `}
          >
            {isPositive ? '↑' : '↓'} {Math.abs(changePercent)}%
          </span>
        )}
      </div>

      {/* Main Value */}
      <div className="mt-2">
        <p className="text-4xl lg:text-5xl font-black italic tracking-tighter text-white">
          {symbol === 'EUR' ? '€' : ''}{formattedValue}
        </p>
        
        {/* Price in EUR (skip for EUR balance) */}
        {price > 0 && symbol !== 'EUR' && (
          <p className="text-base text-white/60 mt-2 font-medium">
            ≈ €{formattedPrice}
          </p>
        )}
      </div>
    </div>
  );
};

export default AssetCard;
