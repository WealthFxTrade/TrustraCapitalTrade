import React, { useState, useMemo } from 'react';
import { Calculator, Zap, ShieldCheck, Info } from 'lucide-react';

const PROTOCOLS = [
  { id: 'starter', name: "Starter", min: 100, dailyRate: 0.0025, color: "text-gray-400" },
  { id: 'basic', name: "Basic", min: 1000, dailyRate: 0.0035, color: "text-emerald-200" },
  { id: 'standard', name: "Standard", min: 5000, dailyRate: 0.0050, color: "text-emerald-400" },
  { id: 'advanced', name: "Advanced", min: 15000, dailyRate: 0.0065, color: "text-emerald-500" },
  { id: 'elite', name: "Elite", min: 50000, dailyRate: 0.0085, color: "text-emerald-600" }
];

export default function PortfolioSimulator() {
  const [amount, setAmount] = useState(5000);
  const [isCompounding, setIsCompounding] = useState(true);

  // Auto-select the best protocol tier based on the input amount
  const activeProtocol = useMemo(() => {
    return [...PROTOCOLS].reverse().find(p => amount >= p.min) || PROTOCOLS[0];
  }, [amount]);

  // Logic: A = P(1 + r)^t for compounding, or A = P + (P * r * t) for simple
  const calculateProjections = () => {
    const P = Number(amount);
    const r = activeProtocol.dailyRate;

    const dailyYield = P * r;
    const weeklyGrowth = isCompounding ? P * (Math.pow(1 + r, 7) - 1) : dailyYield * 7;
    const monthlyProjection = isCompounding ? P * (Math.pow(1 + r, 30) - 1) : dailyYield * 30;
    const yearlyProjection = isCompounding ? P * (Math.pow(1 + r, 365) - 1) : dailyYield * 365;

    return {
      daily: dailyYield,
      weekly: weeklyGrowth,
      monthly: monthlyProjection,
      yearly: yearlyProjection,
      effectiveTotal: P + yearlyProjection
    };
  };

  const results = calculateProjections();

  return (
    <div className="bg-[#0a0c10] border border-white/5 rounded-[2.5rem] p-8 lg:p-12 shadow-2xl relative overflow-hidden">
      <div className="relative z-10 grid lg:grid-cols-2 gap-16">

        {/* ── INPUT SECTION ── */}
        <div className="space-y-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Calculator className="text-emerald-500" size={24} />
              <h2 className="text-2xl font-black uppercase tracking-tighter italic">Yield Calculator</h2>
            </div>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest leading-relaxed">
              Real-time projection for 2026 Rio protocols • Compounded daily
            </p>
          </div>

          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Investment Amount (EUR)</label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-black border border-white/10 rounded-2xl p-6 text-2xl font-black focus:border-emerald-500 outline-none transition-all pr-20 text-white"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-gray-600">EUR</span>
              </div>
              <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">
                Min €100 • Tier Logic: {activeProtocol.name} Activated
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Tier Availability</label>
              <div className="grid grid-cols-1 gap-2">
                {PROTOCOLS.map((p) => (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-500 ${
                      activeProtocol.id === p.id
                        ? 'bg-emerald-500/10 border-emerald-500/50 scale-[1.02]'
                        : 'bg-black/40 border-white/5 opacity-30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Zap size={14} className={activeProtocol.id === p.id ? 'text-emerald-500' : 'text-gray-600'} />
                      <span className={`text-[10px] font-black uppercase tracking-widest ${p.color}`}>{p.name}</span>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400">{(p.dailyRate * 100).toFixed(2)}% daily</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 p-5 bg-white/5 rounded-2xl border border-white/5">
              <button
                onClick={() => setIsCompounding(!isCompounding)}
                className={`w-12 h-6 rounded-full relative transition-all duration-300 ${isCompounding ? 'bg-emerald-600 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-gray-800'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${isCompounding ? 'left-7' : 'left-1'}`} />
              </button>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Apply daily compounding protocol</span>
            </div>
          </div>
        </div>

        {/* ── RESULTS SECTION ── */}
        <div className="bg-black/50 border border-white/5 rounded-[3rem] p-10 space-y-10 relative overflow-hidden flex flex-col justify-center">
          <div className="space-y-8 relative z-10">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500/50 italic">Projected Returns</h3>

            <div className="grid grid-cols-2 gap-y-12 gap-x-8">
              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Daily Yield</p>
                <p className="text-3xl font-black text-emerald-500 tracking-tighter">
                  +€{results.daily.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Weekly Growth</p>
                <p className="text-3xl font-black text-white tracking-tighter">
                  €{results.weekly.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">30-Day Projection</p>
                <p className="text-3xl font-black text-white tracking-tighter">
                  €{results.monthly.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">12-Month Profit</p>
                <p className="text-3xl font-black text-white tracking-tighter">
                  €{results.yearly.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-12 border-t border-white/5 space-y-8 relative z-10">
            <div className="p-8 bg-emerald-600 rounded-[2rem] text-black shadow-2xl shadow-emerald-600/20">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Portfolio Valuation (Year 1)</p>
              <h4 className="text-5xl lg:text-6xl font-black tracking-tighter italic">
                €{results.effectiveTotal.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h4>
              <p className="text-[9px] font-bold mt-6 uppercase tracking-widest leading-relaxed opacity-90">
                Strategic compounding results in a projected {((results.yearly / amount) * 100).toFixed(0)}% increase in total AUM over a 365-day cycle.
              </p>
            </div>

            <div className="flex gap-4 text-gray-600 italic text-[9px] leading-relaxed font-bold uppercase tracking-tighter">
              <Info size={16} className="shrink-0 text-emerald-500/50" />
              <p>Performance based on Rio protocol liquidity nodes. Projections are non-guaranteed and subject to market volatility.</p>
            </div>
          </div>

          {/* BACKGROUND DECORATION */}
          <ShieldCheck className="absolute -bottom-10 -right-10 text-white/[0.02] rotate-12" size={300} />
        </div>
      </div>
    </div>
  );
}

