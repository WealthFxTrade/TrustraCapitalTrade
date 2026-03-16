// src/components/dashboard/TradingChart.jsx
import React from 'react';

const TradingChart = ({ data = [] }) => {
  // If you have no chart library yet → simple placeholder
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-white/40 text-sm italic">
        No chart data available yet...
      </div>
    );
  }

  // Very basic sparkline-style placeholder (replace with real chart later)
  return (
    <div className="h-64 bg-black/30 rounded-xl flex items-center justify-center border border-white/10">
      <div className="text-center">
        <p className="text-2xl font-bold text-white/80">€ {data[data.length-1]?.value?.toLocaleString() || '—'}</p>
        <p className="text-xs text-white/40 mt-2">
          Last updated: {data[data.length-1]?.time || '—'}
        </p>
        <p className="text-[10px] text-white/30 mt-4 italic">
          [ TradingChart placeholder – install recharts or apexcharts to show real chart ]
        </p>
      </div>
    </div>
  );
};

export default TradingChart;
