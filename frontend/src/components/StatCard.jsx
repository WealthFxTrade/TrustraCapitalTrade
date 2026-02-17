import React from 'react';

export default function StatCard({ title, value, trend, highlight }) {
  return (
    <div className={`glass-card p-6 border-l-2 transition-all duration-300 hover:bg-white/5 ${
      highlight ? 'border-l-yellow-500' : 'border-l-slate-700'
    }`}>
      {/* Label: Small, Uppercase, Monospaced feel */}
      <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">
        {title}
      </p>
      
      <div className="flex items-end justify-between">
        {/* Value: Bold White or Cyan for Highlight */}
        <h3 className={`text-2xl font-black tracking-tight ${
          highlight ? 'text-yellow-500' : 'text-white'
        }`}>
          {value}
        </h3>

        {/* Optional Trend Indicator */}
        {trend && (
          <span className="text-[10px] font-bold text-emerald-500 mb-1">
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}

