import React from 'react';
import { TrendingUp, ArrowUpRight, Shield } from 'lucide-react';

export default function StatCard({ title, value, trend, highlight }) {
  return (
    <div className={`
      relative overflow-hidden p-6 rounded-[2rem] border transition-all duration-300
      ${highlight 
        ? 'bg-white/[0.04] border-yellow-500/20 shadow-[0_20px_50px_rgba(234,179,8,0.05)]' 
        : 'bg-white/[0.02] border-white/5 hover:border-white/10'
      }
    `}>
      {/* Background Accent for Highlighted Cards */}
      {highlight && (
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-yellow-500/10 blur-[40px] rounded-full opacity-50" />
      )}

      <div className="flex justify-between items-start mb-4">
        <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">
          {title}
        </p>
        {trend && (
          <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full uppercase tracking-tighter">
            <ArrowUpRight size={10} /> {trend}
          </div>
        )}
      </div>

      <div className="flex items-end justify-between">
        <h3 className={`text-2xl font-black tracking-tighter ${highlight ? 'text-yellow-500' : 'text-white'}`}>
          {value || '---'}
        </h3>
        
        {/* Subtle Icon Indicator */}
        <div className={`p-2 rounded-xl ${highlight ? 'bg-yellow-500/10 text-yellow-500' : 'bg-white/5 text-white/20'}`}>
          {highlight ? <TrendingUp size={14} /> : <Shield size={14} />}
        </div>
      </div>

      {/* Progress Line Decor */}
      <div className="mt-4 h-[1px] w-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />
    </div>
  );
}

