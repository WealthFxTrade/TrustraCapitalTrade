// src/components/dashboard/AssetCard.jsx
import React from 'react';

const AssetCard = ({ label, value = 0, price = 0, icon, symbol = '', highlight = false }) => {
  // Safety check: ensure value and price are numbers
  const safeValue = Number(value) || 0;
  const safePrice = Number(price) || 0;

  // Formatters
  const formattedValue = symbol === 'EUR' 
    ? new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2 }).format(safeValue)
    : safeValue.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 });

  const formattedPrice = safePrice.toLocaleString('de-DE', { 
    style: 'currency', 
    currency: 'EUR' 
  });

  // Simulated daily node performance
  const changePercent = (Math.random() * 2 + 0.1).toFixed(2); // 0.1% to 2.1% growth

  return (
    <div className={`relative overflow-hidden transition-all duration-500 group border rounded-[2.5rem] p-8 ${
      highlight 
        ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_40px_-15px_rgba(16,185,129,0.3)]' 
        : 'bg-[#0a0c10] border-white/5 hover:border-white/20 shadow-2xl'
    }`}>
      
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          {icon && (
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
              highlight ? 'bg-emerald-500 text-black' : 'bg-white/5 text-white/70'
            }`}>
              {icon}
            </div>
          )}
          <div>
            <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] ${
              highlight ? 'text-emerald-400' : 'text-gray-500'
            }`}>{label}</h4>
            <p className="text-xs font-mono text-gray-600 mt-1">{symbol}</p>
          </div>
        </div>
        
        {/* Node Performance Indicator */}
        <div className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
          highlight 
            ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' 
            : 'bg-white/5 border-white/10 text-gray-400'
        }`}>
          + {changePercent}%
        </div>
      </div>

      <div className="relative z-10">
        <div className="flex items-baseline gap-1">
          {symbol === 'EUR' && <span className="text-2xl font-black text-gray-500 mr-1">€</span>}
          <p className={`text-4xl lg:text-5xl font-black tracking-tighter ${
            highlight ? 'text-white' : 'text-white/90'
          }`}>
            {formattedValue}
          </p>
        </div>
        
        {safePrice > 0 && symbol !== 'EUR' && (
          <p className="text-xs font-bold text-gray-500 mt-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            MARKET VALUE: {formattedPrice}
          </p>
        )}
      </div>

      {/* Decorative background element for highlight card */}
      {highlight && (
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full" />
      )}
    </div>
  );
};

export default AssetCard;

