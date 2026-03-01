// src/components/landing/RoiCalculator.jsx
import React, { useState, useEffect } from 'react';
import { ArrowRight, Zap, TrendingUp } from 'lucide-react';

const CALCULATOR_TIERS = [
  { name: 'Starter', roi: 0.25, min: 100, color: 'text-blue-400' }, // 0.25% daily approx ~7.5% monthly
  { name: 'Basic', roi: 0.35, min: 1000, color: 'text-emerald-400' },
  { name: 'Standard', roi: 0.50, min: 5000, color: 'text-purple-400' },
  { name: 'Advanced', roi: 0.65, min: 15000, color: 'text-orange-400' },
  { name: 'Elite', roi: 0.85, min: 50000, color: 'text-yellow-500' }
];

export default function RoiCalculator() {
  const [amount, setAmount] = useState(5000);
  const [selected, setSelected] = useState(CALCULATOR_TIERS[2]);

  useEffect(() => {
    const tier = [...CALCULATOR_TIERS].reverse().find(t => amount >= t.min) || CALCULATOR_TIERS[0];
    setSelected(tier);
  }, [amount]);

  const daily = (amount * (selected.roi / 100)).toFixed(2);
  const weekly = (daily * 7).toFixed(2);

  return (
    <div className="max-w-5xl mx-auto px-6">
      <div className="bg-[#0a0f1e] border border-white/5 rounded-[3rem] p-8 md:p-16 shadow-2xl relative overflow-hidden group">
        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-yellow-500/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter">
              Yield <span className="text-yellow-500 text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-200">Calculator</span>
            </h2>
            <p className="text-gray-500 text-[10px] md:text-xs font-black uppercase tracking-[0.4em] italic">
              Real-time projection for 2026 market protocols.
            </p>
            
            <div className="space-y-4 pt-4">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                <span className="text-gray-600 italic">Input Allocation</span>
                <span className="text-white">€{Number(amount).toLocaleString()}</span>
              </div>
              <input 
                type="range" min="100" max="100000" step="100" 
                value={amount} onChange={(e) => setAmount(e.target.value)}
                className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-yellow-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-black/40 border border-white/5 p-6 rounded-3xl">
              <p className="text-[9px] font-black text-gray-700 uppercase tracking-widest mb-3">24H Protocol Yield</p>
              <p className="text-3xl font-black italic text-emerald-500">+€{daily}</p>
              <p className={`text-[8px] font-bold uppercase mt-2 ${selected.color}`}>Rio {selected.name} Active</p>
            </div>
            <div className="bg-black/40 border border-white/5 p-6 rounded-3xl">
              <p className="text-[9px] font-black text-gray-700 uppercase tracking-widest mb-3">7D Projected Growth</p>
              <p className="text-3xl font-black italic text-white">€{weekly}</p>
              <p className="text-[8px] font-bold uppercase mt-2 text-gray-600 italic">Compounding On</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
