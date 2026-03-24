// src/components/landing/RoiCalculator.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { ArrowRight, Zap, TrendingUp, Info, AlertTriangle } from 'lucide-react';

const CALCULATOR_TIERS = [
  { name: 'Starter', roiDaily: 0.25, min: 100, max: 999, color: 'text-blue-400', bg: 'from-blue-900/20' },
  { name: 'Basic', roiDaily: 0.35, min: 1000, max: 4999, color: 'text-emerald-400', bg: 'from-emerald-900/20' },
  { name: 'Standard', roiDaily: 0.50, min: 5000, max: 14999, color: 'text-purple-400', bg: 'from-purple-900/20' },
  { name: 'Advanced', roiDaily: 0.65, min: 15000, max: 49999, color: 'text-orange-400', bg: 'from-orange-900/20' },
  { name: 'Elite', roiDaily: 0.85, min: 50000, max: Infinity, color: 'text-yellow-500', bg: 'from-yellow-900/20' },
];

export default function RoiCalculator() {
  const [amount, setAmount] = useState(5000);
  const [selectedTier, setSelectedTier] = useState(CALCULATOR_TIERS[2]); // Standard as default
  const [compound, setCompound] = useState(true); // daily vs compounded

  // Auto-select tier based on amount
  useEffect(() => {
    const tier = [...CALCULATOR_TIERS].reverse().find(t => amount >= t.min) || CALCULATOR_TIERS[0];
    setSelectedTier(tier);
  }, [amount]);

  // Calculations (daily yield, weekly, monthly, yearly)
  const projections = useMemo(() => {
    const dailyRate = selectedTier.roiDaily / 100;
    const daily = amount * dailyRate;

    const weekly = daily * 7;
    const monthly = daily * 30;
    const yearly = daily * 365;

    const compoundedDaily = amount * Math.pow(1 + dailyRate, 365) - amount;
    const compoundedMonthly = amount * Math.pow(1 + dailyRate, 30) - amount;

    return {
      daily: daily.toFixed(2),
      weekly: weekly.toFixed(2),
      monthly: monthly.toFixed(2),
      yearly: yearly.toFixed(2),
      compoundedDaily: compoundedDaily.toFixed(2),
      compoundedMonthly: compoundedMonthly.toFixed(2),
    };
  }, [amount, selectedTier]);

  const formatEUR = (value) =>
    new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(value);

  const handleAmountChange = (e) => {
    const val = e.target.value;
    if (val === '' || (!isNaN(val) && Number(val) >= 0)) {
      setAmount(val === '' ? '' : Number(val));
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-[#0a0f1e] border border-white/8 rounded-[3rem] p-8 lg:p-16 shadow-2xl relative overflow-hidden group">
        {/* Decorative glow */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-yellow-600/10 blur-[120px] rounded-full pointer-events-none group-hover:opacity-80 transition-opacity" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Input & Tier Selection */}
          <div className="space-y-10">
            <div className="space-y-4">
              <h2 className="text-4xl lg:text-6xl font-black uppercase italic tracking-tighter text-white">
                Yield <span className="text-yellow-500 bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-200">Calculator</span>
              </h2>
              <p className="text-gray-500 text-[10px] lg:text-xs font-black uppercase tracking-[0.4em] italic">
                Real-time projection for 2026 Rio protocols • Compounded daily
              </p>
            </div>

            {/* Amount Input */}
            <div className="space-y-3">
              <label htmlFor="investment-amount" className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em] ml-2 block">
                Investment Amount (EUR)
              </label>
              <div className="relative group">
                <input
                  id="investment-amount"
                  type="number"
                  min={100}
                  step={100}
                  value={amount}
                  onChange={handleAmountChange}
                  className="w-full bg-black/50 border border-white/10 rounded-2xl py-5 px-6 text-2xl lg:text-3xl font-black outline-none focus:border-yellow-500/50 transition-all placeholder:text-gray-700"
                  placeholder="Enter amount"
                  aria-describedby="amount-help"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[11px] font-black text-gray-600 uppercase pointer-events-none">
                  EUR
                </span>
              </div>
              <p id="amount-help" className="text-[10px] text-gray-600 ml-2">
                Minimum €100 • Recommended for {selectedTier.name}: €{selectedTier.min.toLocaleString()}
              </p>
            </div>

            {/* Tier Selector */}
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em] ml-2 block">
                Recommended Protocol Tier
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {CALCULATOR_TIERS.map((tier) => (
                  <button
                    key={tier.name}
                    onClick={() => {
                      setSelectedTier(tier);
                      setAmount(Math.max(amount, tier.min));
                    }}
                    className={`p-4 lg:p-6 rounded-2xl border transition-all duration-300 text-center group focus:outline-none focus:ring-2 focus:ring-yellow-500/50 ${
                      selectedTier.name === tier.name
                        ? 'border-yellow-500 bg-yellow-500/10 shadow-lg shadow-yellow-900/20'
                        : 'border-white/10 hover:border-white/30 hover:bg-white/5'
                    }`}
                    aria-pressed={selectedTier.name === tier.name}
                    aria-label={`Select ${tier.name} tier`}
                  >
                    <h4 className={`text-lg font-black ${tier.color}`}>{tier.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">{tier.roiDaily}% daily</p>
                    <p className="text-[10px] text-gray-600 mt-2">Min €{tier.min.toLocaleString()}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Compounding Toggle */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="compound"
                checked={compound}
                onChange={() => setCompound(!compound)}
                className="w-5 h-5 rounded border-white/20 bg-black/50 focus:ring-yellow-500/50 accent-yellow-500"
              />
              <label htmlFor="compound" className="text-sm text-gray-300 cursor-pointer">
                Apply daily compounding (recommended)
              </label>
            </div>
          </div>

          {/* Right: Projections */}
          <div className="space-y-8 bg-black/40 border border-white/10 rounded-[2.5rem] p-8 lg:p-12 backdrop-blur-md">
            <h3 className="text-2xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
              <Zap size={24} className="text-yellow-500" /> Projected Returns
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Daily Yield</p>
                <p className="text-3xl lg:text-4xl font-black text-emerald-400">
                  +€{projections.daily}
                </p>
                <p className="text-xs text-gray-600">{compound ? '(compounded)' : '(simple)'}</p>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Weekly Growth</p>
                <p className="text-3xl lg:text-4xl font-black text-white">
                  €{projections.weekly}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Monthly Projection</p>
                <p className="text-3xl lg:text-4xl font-black text-white">
                  €{projections.monthly}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Yearly Projection</p>
                <p className="text-3xl lg:text-4xl font-black text-yellow-400">
                  €{projections.yearly}
                </p>
              </div>
            </div>

            {compound && (
              <div className="pt-6 border-t border-white/10">
                <p className="text-sm text-gray-400">
                  With daily compounding, your projected yearly return could reach{' '}
                  <span className="text-emerald-400 font-bold">€{projections.compoundedDaily}</span> (effective yield).
                </p>
              </div>
            )}

            <div className="flex items-start gap-3 pt-4 text-[10px] text-gray-500">
              <AlertTriangle size={16} className="text-yellow-500 shrink-0 mt-1" />
              <p>
                Projections are illustrative only. Actual returns depend on market conditions. No guarantee of profit.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
