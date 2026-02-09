import React from 'react';
import { TrendingUp, Users, Wallet, Activity } from 'lucide-react';

const AdminStatsCard = ({ title, value, icon: Icon, trend, suffix = "€" }) => {
  return (
    <div className="bg-[#0a0d14] border border-white/5 p-6 rounded-[2rem] relative overflow-hidden group hover:border-blue-500/30 transition-all duration-500">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon size={80} />
      </div>
      
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
          <Icon size={20} />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{title}</span>
      </div>

      <div className="flex items-baseline gap-2">
        <h3 className="text-3xl font-black italic tracking-tighter text-white">
          {suffix}{value?.toLocaleString('de-DE')}
        </h3>
        {trend && (
          <span className="text-[9px] font-bold text-emerald-500 flex items-center gap-1">
            <TrendingUp size={10} /> {trend}%
          </span>
        )}
      </div>
      
      <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
        <div className="h-full bg-blue-600 w-1/3 group-hover:w-1/2 transition-all duration-700"></div>
      </div>
    </div>
  );
};

export default AdminStatsCard;

