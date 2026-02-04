// src/pages/Dashboard.jsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import DashboardHeader from '../components/DashboardHeader';
import DashboardCharts from '../components/DashboardCharts';
import RecentTransactions from '../components/RecentTransactions';
import {
  getUserBalance,
  getBtcPrice,
  getInvestmentPlans,
  getTransactions,
} from '../api';

export default function DashboardPage({ user, logout }) {
  const [data, setData] = useState({
    balance: 0,
    plan: 'Basic',
    dailyRate: 0,
    btcPrice: 73000,                    // realistic 2026 starting point
    btcHistory: Array(15).fill(73000),  // smooth chart initialization
    plans: [],
    transactions: [],
  });

  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const latestDataRef = useRef(data);
  useEffect(() => {
    latestDataRef.current = data;
  }, [data]);

  // ── Fetch real dashboard data ───────────────────────────────────────
  const fetchDashboardData = useCallback(async (signal) => {
    try {
      setFetchError(null);
      const [userRes, btcRes, plansRes, txRes] = await Promise.all([
        getUserBalance(signal),
        getBtcPrice(signal),
        getInvestmentPlans(signal),
        getTransactions(signal),
      ]);

      const btcPrice = Number(btcRes?.data?.price ?? latestDataRef.current.btcPrice);

      setData((prev) => ({
        ...prev,
        balance: userRes?.data?.user?.balance ?? prev.balance,
        plan: userRes?.data?.user?.plan ?? prev.plan,
        dailyRate: userRes?.data?.dailyRate ?? prev.dailyRate,
        btcPrice,
        plans: plansRes?.data ?? prev.plans,
        transactions: txRes?.data?.transactions ?? prev.transactions,
        btcHistory: [...prev.btcHistory, btcPrice].slice(-60),
      }));
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('Dashboard data fetch failed:', err);
      setFetchError('Failed to load latest dashboard data. Showing last known values.');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── BTC price simulation (only in dev/demo) ─────────────────────────
  const simulateBtcPrice = useCallback(() => {
    setData((prev) => {
      const volatility = (Math.random() - 0.5) * 0.004; // ±0.2%
      const newPrice = Number((prev.btcPrice * (1 + volatility)).toFixed(2));
      return {
        ...prev,
        btcPrice: newPrice,
        btcHistory: [...prev.btcHistory, newPrice].slice(-60),
      };
    });
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    // Initial fetch
    fetchDashboardData(controller.signal);

    // Periodic real refresh (every 30 seconds)
    const refreshInterval = setInterval(() => {
      fetchDashboardData(controller.signal);
    }, 30000);

    // Simulation only in development / demo environments
    const isDemoMode =
      import.meta.env.DEV ||
      import.meta.env.MODE === 'development' ||
      import.meta.env.VITE_DEMO_MODE === 'true';

    let priceInterval = null;
    if (isDemoMode) {
      priceInterval = setInterval(simulateBtcPrice, 2200); // slight natural jitter
    }

    return () => {
      controller.abort();
      clearInterval(refreshInterval);
      if (priceInterval) clearInterval(priceInterval);
    };
  }, [fetchDashboardData, simulateBtcPrice]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-t-4 border-indigo-500 rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <DashboardHeader
        user={user}
        balance={data.balance}
        plan={data.plan}
        logout={logout}
      />

      {/* Error feedback */}
      {fetchError && (
        <div className="max-w-7xl mx-auto px-4 pt-5">
          <div className="bg-red-900/40 border border-red-700 text-red-100 px-5 py-3.5 rounded-xl text-center">
            {fetchError}
          </div>
        </div>
      )}

      {/* No transactions warning (visible feedback) */}
      {!fetchError && data.transactions.length === 0 && (
        <div className="max-w-7xl mx-auto px-4 pt-5">
          <div className="bg-amber-900/30 border border-amber-700/50 text-amber-200 px-5 py-3.5 rounded-xl flex items-center gap-3">
            <svg
              className="h-5 w-5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <span className="font-medium">No transactions found yet.</span>
              <span className="ml-1.5 opacity-90">
                This is normal for new accounts — or there may be a temporary data issue.
              </span>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-10">
        <DashboardCharts
          btcHistory={data.btcHistory}
          btcPrice={data.btcPrice}
          plans={data.plans}
        />
        <RecentTransactions transactions={data.transactions} />
      </main>
    </div>
  );
}
