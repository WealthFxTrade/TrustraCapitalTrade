// src/components/landing/RoiCalculator.jsx
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

// ── STRATEGY TIERS ──
const TIERS = [
  { id: 'starter', name: 'Tier I: Entry', yieldMin: 6, yieldMax: 9, min: 100, max: 1000, color: 'text-emerald-500/70' },
  { id: 'basic', name: 'Tier II: Core', yieldMin: 9, yieldMax: 12, min: 1000, max: 5000, color: 'text-emerald-500/80' },
  { id: 'standard', name: 'Tier III: Prime', yieldMin: 12, yieldMax: 16, min: 5000, max: 15000, color: 'text-emerald-400' },
  { id: 'advanced', name: 'Tier IV: Institutional', yieldMin: 16, yieldMax: 20, min: 15000, max: 50000, color: 'text-emerald-300' },
  { id: 'elite', name: 'Tier V: Sovereign', yieldMin: 20, yieldMax: 25, min: 50000, max: 1000000, color: 'text-emerald-200' },
];

export default function RoiCalculator() {
  const navigate = useNavigate();
  const [investment, setInvestment] = useState(5000);
  const [duration, setDuration] = useState(12);

  // Auto-detect Tier based on Investment
  const activeTier = useMemo(() => {
    return TIERS.find(t => investment >= t.min && investment < t.max) || TIERS[TIERS.length - 1];
  }, [investment]);

  // Alpha Projection Calculation
  const projection = useMemo(() => {
    const avgAnnualRate = (activeTier.yieldMin + activeTier.yieldMax) / 2 / 100;
    const monthlyRate = avgAnnualRate / 12;
    const futureValue = investment * Math.pow(1 + monthlyRate, duration);
    const totalProfit = futureValue - investment;
    const monthlyGain = totalProfit / duration;

    return {
      monthly: Math.round(monthlyGain),
      total: Math.round(futureValue),
      totalProfit: Math.round(totalProfit),
      displayRate: `${activeTier.yieldMin}–${activeTier.yieldMax}%`
    };
  }, [investment, duration, activeTier]);

  const formatEUR = (val) =>
    new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(val);

  return (
    <div className="w-full bg-[#0a0c10] border border-white/5 rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden shadow-2xl">
      <div className="grid grid-cols-1 lg:grid-cols-2">

        {/* INPUT SIDE */}
        <div className="p-8 md:p-12 space-y-10 border-b lg:border-b-0 lg:border-r border-white/5 bg-white/[0.01]">
          <header className="space-y-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">Rio Engine Simulator</h3>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-tight">Adjust liquidity to view projected alpha growth.</p>
          </header>

          <div className="space-y-10">
            {/* Investment Slider */}
            <div className="space-y-5">
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Capital Entry</label>
                <span className="text-3xl font-black text-white tracking-tighter">{formatEUR(investment)}</span>
              </div>
              <input
                type="range"
                min="100"
                max="100000"
                step="100"
                value={investment}
                onChange={(e) => setInvestment(Number(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[8px] text-gray-600 font-black uppercase tracking-widest">
                <span>€100 (Min)</span>
                <span>€100,000+ (Institutional)</span>
              </div>
            </div>

            {/* Duration Slider */}
            <div className="space-y-5">
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Maturity Horizon</label>
                <span className="text-3xl font-black text-white tracking-tighter">
                  {duration} <span className="text-xs text-gray-600 uppercase">Months</span>
                </span>
              </div>
              <input
                type="range"
                min="3"
                max="60"
                step="1"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          </div>

          {/* Detected Tier & Yield */}
          <div className="p-6 bg-black/40 border border-white/5 rounded-2xl flex items-center justify-between">
            <div>
              <span className="block text-[8px] font-black uppercase tracking-widest text-gray-600 mb-1">Detected Tier</span>
              <span className={`text-sm font-black uppercase tracking-tight ${activeTier.color}`}>{activeTier.name}</span>
            </div>
            <div className="text-right">
              <span className="block text-[8px] font-black uppercase tracking-widest text-gray-600 mb-1">Target Yield</span>
              <span className="text-sm font-black text-white italic">{activeTier.yieldMin}-{activeTier.yieldMax}%</span>
            </div>
          </div>
        </div>

        {/* OUTPUT SIDE */}
        <div className="p-8 md:p-12 flex flex-col justify-between bg-emerald-500/[0.02]">
          <div className="space-y-10">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Projected Equity Outcome</span>
              <div className="text-5xl md:text-6xl font-black italic text-emerald-500 tracking-tighter drop-shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                {formatEUR(projection.total)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                <span className="block text-[9px] font-black text-gray-600 uppercase mb-2">Monthly Gain</span>
                <span className="text-xl font-black text-white">{formatEUR(projection.monthly)}</span>
              </div>
              <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                <span className="block text-[9px] font-black text-gray-600 uppercase mb-2">Alpha Profit</span>
                <span className="text-xl font-black text-emerald-400">+{formatEUR(projection.totalProfit)}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
              <TrendingUp size={20} className="text-emerald-500" />
              <div>
                <span className="block text-[9px] font-black text-emerald-500 uppercase tracking-widest">Expected Annual Alpha</span>
                <span className="text-sm font-black text-white uppercase tracking-tight">{projection.displayRate} Randomized Mean</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/register', { state: { plan: activeTier.id } })}
            className="w-full mt-12 py-5 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-500 transition-all flex items-center justify-center gap-3 group shadow-2xl"
          >
            Provision {activeTier.id.charAt(0).toUpperCase() + activeTier.id.slice(1)} Tier <ArrowRight className="group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
      </div>

      {/* DISCLAIMER */}
      <div className="px-8 py-6 bg-black/60 border-t border-white/5">
        <div className="flex gap-4 items-start">
          <AlertTriangle size={16} className="text-yellow-600 shrink-0 mt-0.5" />
          <p className="text-[9px] text-gray-600 font-bold uppercase leading-relaxed text-justify italic">
            Institutional Risk Notice: All figures are high-fidelity simulations based on historical algorithmic trajectory. Past performance does not guarantee future alpha. Actual returns subject to market liquidity and systemic volatility.
          </p>
        </div>
      </div>
    </div>
  );
}
