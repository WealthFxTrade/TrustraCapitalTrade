// src/pages/Dashboard/WalletCard.jsx
import React, { useState } from 'react';
import { Eye, EyeOff, TrendingUp, Wallet, ShieldCheck } from 'lucide-react';

export default function WalletCard({
  type = 'main',           // 'main' | 'profit'
  amount = 0,              // number in EUR
  trend = 0,               // optional: percentage change (e.g. +2.5 or -1.2)
  showSecurityBadge = true,
}) {
  const [isVisible, setIsVisible] = useState(true);

  // Card configuration
  const config = {
    main: {
      label: 'Total Balance',
      icon: <Wallet size={22} />,
      color: 'blue',
      gradient: 'from-blue-700/20 to-transparent',
      borderColor: 'border-blue-600/30',
      textColor: 'text-blue-400',
    },
    profit: {
      label: 'Realized Profit',
      icon: <TrendingUp size={22} />,
      color: 'emerald',
      gradient: 'from-emerald-700/20 to-transparent',
      borderColor: 'border-emerald-600/30',
      textColor: 'text-emerald-400',
    },
  };

  const theme = config[type] || config.main;

  // Format EUR with proper commas & decimals
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const trendColor = trend > 0 ? 'text-emerald-400' : trend < 0 ? 'text-rose-400' : 'text-gray-400';
  const trendIcon = trend > 0 ? '↑' : trend < 0 ? '↓' : '';

  return (
    <div
      className={`relative overflow-hidden bg-[#0f1218] border \( {theme.borderColor} rounded-[2.5rem] p-8 md:p-10 transition-all duration-300 hover:shadow-2xl hover:shadow- \){theme.color}-900/20 group focus-within:shadow-2xl focus-within:shadow-${theme.color}-900/20`}
      role="region"
      aria-label={`${theme.label} card`}
    >
      {/* Subtle animated gradient background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-40 group-hover:opacity-60 transition-opacity duration-500`}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className={`p-3.5 rounded-2xl bg-white/5 text-${theme.color}-500 group-hover:scale-110 transition-transform`}>
              {theme.icon}
            </div>
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-gray-500 group-hover:text-gray-300 transition-colors">
                {theme.label}
              </h3>
              {trend !== 0 && (
                <p className={`text-[10px] font-bold ${trendColor} flex items-center gap-1 mt-0.5`}>
                  {trendIcon} {Math.abs(trend).toFixed(1)}% <span className="text-gray-600">24h</span>
                </p>
              )}
            </div>
          </div>

          {/* Visibility Toggle */}
          <button
            type="button"
            onClick={() => setIsVisible(!isVisible)}
            className="p-2.5 rounded-xl hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0f1218] focus:ring-yellow-500/50"
            aria-label={isVisible ? 'Hide balance' : 'Show balance'}
            aria-pressed={!isVisible}
          >
            {isVisible ? (
              <EyeOff size={18} className="text-gray-400 hover:text-white transition-colors" />
            ) : (
              <Eye size={18} className="text-gray-400 hover:text-white transition-colors" />
            )}
          </button>
        </div>

        {/* Balance Display */}
        <div className="flex items-baseline gap-3 mb-10">
          <h2
            className={`text-4xl md:text-5xl font-black tracking-tighter transition-all duration-300 ${
              isVisible ? 'text-white opacity-100' : 'text-gray-700 opacity-40 blur-sm select-none'
            }`}
          >
            {isVisible ? formatCurrency(amount) : '•••••••'}
          </h2>

          <span className="text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-400">
            Live
          </span>
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between border-t border-white/8 pt-6">
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-600">
              Node Security
            </span>
            <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-500" /> AES-256 Encrypted
            </span>
          </div>

          {/* Decorative nodes (visual flair) */}
          <div className="flex -space-x-2">
            <div className={`w-7 h-7 rounded-full border-2 border-[#0f1218] bg-${theme.color}-600 shadow-md`} />
            <div className={`w-7 h-7 rounded-full border-2 border-[#0f1218] bg-gray-800 shadow-md`} />
          </div>
        </div>
      </div>
    </div>
  );
}
