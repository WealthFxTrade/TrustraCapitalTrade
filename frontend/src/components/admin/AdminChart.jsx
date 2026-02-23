import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

/**
 * @desc    Renders a 2026-style dark financial chart
 * @param {Array} data - Array of objects { date: string, volume: number }
 */
export default function AdminChart({ data }) {
  return (
    <div className="h-[400px] w-full bg-[#0a0d14] p-6 rounded-[2.5rem] border border-white/5 shadow-2xl">
      <div className="flex justify-between items-center mb-6 px-2">
        <div>
          <h3 className="text-sm font-black uppercase text-slate-500 tracking-[0.2em]">Deployment Trends</h3>
          <p className="text-xs text-blue-500 font-bold">Volume Over Time (EUR)</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
          
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#475569', fontSize: 10, fontWeight: 'bold' }} 
            dy={10}
          />
          
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#475569', fontSize: 10, fontWeight: 'bold' }}
            tickFormatter={(value) => `€${value > 1000 ? value / 1000 + 'k' : value}`}
          />
          
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#0f172a', 
              border: '1px solid #1e293b', 
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
            itemStyle={{ color: '#3b82f6' }}
          />

          <Area 
            type="monotone" 
            dataKey="volume" 
            stroke="#3b82f6" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorVolume)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

