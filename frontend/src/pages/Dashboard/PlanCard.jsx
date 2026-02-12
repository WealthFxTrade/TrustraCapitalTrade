// src/pages/Dashboard/PlanCard.jsx
import { ArrowUpRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function PlanCard({ plan, onInvest }) {
  const { name, min, max, roiDaily, duration, color = 'blue', icon } = plan;

  // Map color themes for icon & hover
  const colorMap = {
    blue: { text: 'text-blue-400', border: 'hover:border-blue-500/30', icon: 'bg-blue-500/10' },
    emerald: { text: 'text-emerald-400', border: 'hover:border-emerald-500/30', icon: 'bg-emerald-500/10' },
    purple: { text: 'text-purple-400', border: 'hover:border-purple-500/30', icon: 'bg-purple-500/10' },
    amber: { text: 'text-amber-400', border: 'hover:border-amber-500/30', icon: 'bg-amber-500/10' },
    rose: { text: 'text-rose-400', border: 'hover:border-rose-500/30', icon: 'bg-rose-500/10' },
  };
  const theme = colorMap[color] || colorMap.blue;

  // ROI width for visual bar
  const roiPercent = (roiDaily / 3.5) * 100;

  return (
    <div
      onClick={onInvest}
      tabIndex={0}
      className={`cursor-pointer bg-[#0f1218] border border-white/5 rounded-[2rem] p-8 flex flex-col justify-between shadow-xl overflow-hidden group transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] ${theme.border} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
    >
      {/* Top Row: Icon + Duration */}
      <div className="flex justify-between items-start mb-6">
        <div className={`p-4 rounded-2xl bg-white/10 backdrop-blur-md group-hover:bg-white/20 transition-colors`}>
          {icon}
        </div>
        <span className="text-[10px] font-black bg-black/30 backdrop-blur-md px-4 py-1.5 rounded-full uppercase tracking-widest border border-white/10">
          {duration} Days Term
        </span>
      </div>

      {/* Plan Name + ROI */}
      <h3 className="text-2xl font-black mb-1 tracking-tight">{name} Tier</h3>
      <div className="flex items-baseline gap-1 mb-6">
        <span className="text-5xl font-black text-white tracking-tighter">{roiDaily}%</span>
        <span className="text-white/50 font-bold text-xs uppercase tracking-widest">Daily ROI</span>
      </div>

      {/* Investment Range & ROI Bar */}
      <div className="space-y-3 mb-8">
        <div className="flex justify-between text-xs font-bold text-white/70 uppercase">
          <span>Limit</span>
          <span className="text-white">€{min.toLocaleString()} - {max === Infinity ? '∞' : `€${max.toLocaleString()}`}</span>
        </div>
        <div className="w-full bg-black/20 h-1.5 rounded-full overflow-hidden">
          <div className="bg-white h-full transition-all duration-1000" style={{ width: `${roiPercent}%` }} />
        </div>
      </div>

      {/* Footer: Insured + Invest Button */}
      <div className="flex justify-between items-center mt-auto pt-4 border-t border-white/10">
        <div className="flex items-center gap-2 text-[10px] text-white font-black uppercase tracking-widest opacity-80">
          <CheckCircle2 size={14} className="text-green-400" /> Insured
        </div>
        <button
          onClick={onInvest}
          className="px-6 py-3 bg-white text-black hover:bg-indigo-400 hover:text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95"
        >
          Invest Now
        </button>
      </div>
    </div>
  );
}
