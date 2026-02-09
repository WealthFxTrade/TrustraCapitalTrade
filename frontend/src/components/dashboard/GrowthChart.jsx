import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

export default function GrowthChart({ ledger = [] }) {
  // 1. Process Ledger into Cumulative Growth Data
  const chartData = ledger
    .filter(item => item.status === 'completed')
    .slice(-10) // Last 10 operations
    .reverse()
    .reduce((acc, curr, idx) => {
      const prevTotal = idx === 0 ? 0 : acc[idx - 1].total;
      acc.push({
        date: new Date(curr.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        total: prevTotal + curr.amount,
        type: curr.type
      });
      return acc;
    }, []);

  return (
    <div className="h-[300px] w-full bg-[#0a0d14] border border-white/5 p-6 rounded-[2.5rem] mt-8 shadow-2xl relative overflow-hidden">
       <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-emerald-500 opacity-20"></div>
       
       <header className="mb-6 flex justify-between items-center">
         <div>
           <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Node Yield Analysis</h3>
           <p className="text-xl font-black italic uppercase tracking-tighter text-white">Capital Growth</p>
         </div>
         <div className="text-right">
           <span className="text-[9px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">Live Sync</span>
         </div>
       </header>

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#475569', fontSize: 9, fontWeight: 900 }} 
            dy={10}
          />
          <YAxis 
            hide={true} 
            domain={['dataMin - 100', 'dataMax + 100']} 
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#05070a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold' }}
            itemStyle={{ color: '#60a5fa' }}
          />
          <Area 
            type="monotone" 
            dataKey="total" 
            stroke="#2563eb" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorTotal)" 
            animationDuration={2000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

