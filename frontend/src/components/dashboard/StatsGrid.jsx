import React from 'react';
import StatCard from '../../pages/Dashboard/StatCard';

export default function StatsGrid({ stats, loading }) {
  // Skeleton Loading State
  if (loading || !stats) {
    return (
      // Changed gap-6 to gap-4 on mobile (p-4) to save screen real estate
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="bg-white/5 border border-white/5 animate-pulse rounded-3xl h-32 w-full"
          />
        ))}
      </div>
    );
  }

  // Destruction with safe defaults
  const {
    mainBalance = 0,
    activePlan = 'No Active Node',
    totalInvested = 0,
    totalProfit = 0
  } = stats;

  // Helper for consistent currency formatting
  const formatEuro = (val) => 
    Number(val).toLocaleString('en-IE', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 2 
    });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      <StatCard
        title="Main Portfolio"
        value={formatEuro(mainBalance)}
        highlight
      />

      <StatCard
        title="Network Node"
        value={activePlan || 'Inactive'}
      />

      <StatCard
        title="Total Capital"
        value={formatEuro(totalInvested)}
      />

      <StatCard
        title="Accumulated Yield"
        value={formatEuro(totalProfit)}
        // Trend logic looks good; ensures green text if profit is positive
        trend={totalProfit > 0 ? `+${totalProfit.toFixed(2)}` : totalProfit.toFixed(2)}
        highlight={totalProfit > 0}
      />
    </div>
  );
}
