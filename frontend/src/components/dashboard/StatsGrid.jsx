import React from 'react';
import StatCard from '../../pages/Dashboard/StatCard';

export default function StatsGrid({ stats, loading }) {
  // Skeleton Loading State
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div 
            key={idx} 
            className="bg-slate-800/20 border border-white/5 animate-pulse rounded-3xl h-32 w-full" 
          />
        ))}
      </div>
    );
  }

  // Safe extraction with default values to prevent .toLocaleString() crashes
  const { 
    mainBalance = 0, 
    activePlan = 'No Active Node', 
    totalInvested = 0, 
    totalProfit = 0 
  } = stats;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Main Portfolio"
        value={`€${mainBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
        highlight
      />
      
      <StatCard 
        title="Network Node" 
        value={activePlan} 
      />

      <StatCard
        title="Total Capital"
        value={`€${totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
      />

      <StatCard
        title="Accumulated Yield"
        value={`€${totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
        trend={totalProfit >= 0 ? `+${totalProfit.toFixed(2)}` : totalProfit.toFixed(2)}
        highlight={totalProfit > 0}
      />
    </div>
  );
}

