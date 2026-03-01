import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  TrendingUp, Zap, ShieldCheck, 
  ArrowUpRight, ArrowDownRight, Activity, Wallet, RefreshCw 
} from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip, XAxis } from 'recharts';

export default function Dashboard() {
  const { user } = useAuth();
  
  // Static mock data for the growth trend
  const performanceData = [
    { day: 'Mon', val: 2400 }, { day: 'Tue', val: 1398 },
    { day: 'Wed', val: 9800 }, { day: 'Thu', val: 3908 },
    { day: 'Fri', val: 4800 }, { day: 'Sat', val: 3800 },
    { day: 'Sun', val: 4300 },
  ];

  return (
    <div className="p-6 lg:p-12 space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
      
      {/* 1. Header: System Status */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">
            Terminal <span className="text-yellow-500">Overview</span>
          </h1>
          <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em] mt-2 italic">
            Secure Node Session: Active
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-[9px] font-black text-gray-700 uppercase tracking-widest leading-none mb-1">Last Sync</p>
            <p className="text-[11px] font-black text-white italic uppercase tracking-tighter">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="h-12 w-[1px] bg-white/5 hidden sm:block" />
          <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
            <Activity size={14} className="text-emerald-500 animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">12ms Latency</span>
          </div>
        </div>
      </header>

      {/* 2. Primary Metrics: Balance & Node Power */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Liquidity Card */}
        <div className="lg:col-span-2 bg-[#0a0c10] border border-white/5 rounded-[3rem] p-10 relative overflow-hidden group shadow-2xl">
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none group-hover:opacity-[0.07] transition-opacity">
            <Wallet size={200} />
          </div>

          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] italic">Available Liquidity</p>
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-black italic text-gray-700">€</span>
                  <h2 className="text-6xl font-black italic tracking-tighter text-white">
                    {user?.balances?.EUR?.toLocaleString() || '0,00'}
                  </h2>
                </div>
              </div>
              <div className="bg-yellow-500 text-black px-4 py-2 rounded-xl flex items-center gap-2 text-[10px] font-black italic shadow-lg shadow-yellow-500/20">
                <TrendingUp size={14} /> +8.41%
              </div>
            </div>

            {/* Sparkline Visual */}
            <div className="h-32 w-full mt-10">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#854d0e" />
                      <stop offset="100%" stopColor="#eab308" />
                    </linearGradient>
                  </defs>
                  <Line 
                    type="monotone" 
                    dataKey="val" 
                    stroke="url(#lineGradient)" 
                    strokeWidth={4} 
                    dot={false} 
                    animationDuration={2000}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Node Power Card */}
        <div className="bg-white rounded-[3rem] p-10 flex flex-col justify-between text-black relative overflow-hidden shadow-2xl group cursor-pointer hover:bg-yellow-500 transition-colors duration-500">
          <Zap className="absolute -right-6 -top-6 opacity-10 w-48 h-48 group-hover:scale-110 transition-transform" />
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Active Power Nodes</p>
            <h3 className="text-7xl font-black italic tracking-tighter mt-2">02</h3>
            <p className="text-[9px] font-bold uppercase tracking-widest mt-4 opacity-50 italic">Capacity: 84% Optimized</p>
          </div>
          <button className="w-full py-5 bg-black text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-95 transition-all">
            Upgrade Tier
          </button>
        </div>
      </div>

      {/* 3. Sub-Metric Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MiniStat label="Pending Yield" value="€24.12" icon={<RefreshCw size={14} className="animate-spin-slow"/>} color="text-yellow-500" />
        <MiniStat label="Network Status" value="Institutional" icon={<ShieldCheck size={14}/>} color="text-emerald-500" />
        <MiniStat label="24h Delta" value="+€104.90" icon={<ArrowUpRight size={14}/>} color="text-blue-500" />
      </div>

      {/* 4. Recent Activity Placeholder */}
      <div className="bg-[#0a0c10] border border-white/5 rounded-[3rem] p-10">
        <div className="flex justify-between items-center mb-10">
          <h3 className="text-xs font-black uppercase tracking-[0.4em] italic text-gray-500">Latest Operations</h3>
          <button className="text-[9px] font-black uppercase tracking-widest text-yellow-500 hover:text-white transition-colors">View Ledger</button>
        </div>
        <div className="space-y-4 text-center py-10">
          <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto opacity-20">
             <Activity size={20} />
          </div>
          <p className="text-[9px] font-black text-gray-700 uppercase tracking-[0.4em] italic">No recent node extractions detected</p>
        </div>
      </div>

    </div>
  );
}

function MiniStat({ label, value, icon, color }) {
  return (
    <div className="bg-[#0a0c10] border border-white/5 p-8 rounded-[2.5rem] flex items-center justify-between group hover:border-white/10 transition-all shadow-inner">
      <div className="space-y-1">
        <p className="text-[8px] font-black text-gray-700 uppercase tracking-[0.4em] italic">{label}</p>
        <p className="text-sm font-black italic text-white uppercase tracking-tight">{value}</p>
      </div>
      <div className={`${color} bg-white/5 p-3 rounded-xl transition-colors`}>{icon}</div>
    </div>
  );
}
