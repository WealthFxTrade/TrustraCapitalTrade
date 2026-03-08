import React, { useState, useEffect, useMemo } from 'react';

export default function QuantumCounter({ principal, roiBalance, dailyRate }) {
  // Total start value is the sum of Principal + accrued ROI
  const initialValue = useMemo(() => Number(principal) + Number(roiBalance), [principal, roiBalance]);
  const [displayValue, setDisplayValue] = useState(initialValue);

  useEffect(() => {
    // 86400 seconds in a day. We update every 50ms (20 times per second).
    // Total intervals per day = 86400 * 20 = 1,728,000
    const dailyGrowth = initialValue * dailyRate;
    const incrementPerInterval = dailyGrowth / 1728000;

    const timer = setInterval(() => {
      setDisplayValue(prev => prev + incrementPerInterval);
    }, 50);

    return () => clearInterval(timer);
  }, [initialValue, dailyRate]);

  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-yellow-500/50 mb-1">
        Live Portfolio Value
      </span>
      <div className="text-4xl lg:text-6xl font-black italic tracking-tighter text-white font-mono">
        €{displayValue.toLocaleString(undefined, { 
          minimumFractionDigits: 6, 
          maximumFractionDigits: 6 
        })}
      </div>
    </div>
  );
}
