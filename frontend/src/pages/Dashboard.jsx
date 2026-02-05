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
import { AlertCircle } from 'lucide-react'; // FIXED: Added missing icon import
import toast from 'react-hot-toast';

export default function DashboardPage({ user, logout }) {
  const [data, setData] = useState({
    balance: 0,
    plan: 'Basic',
    dailyRate: 0,
    btcPrice: 73000,
    btcHistory: Array(15).fill(73000),
    plans: [],
    transactions: [],
  });

  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Use a ref to track the latest data for background updates without stale closures
  const latestDataRef = useRef(data);
  useEffect(() => {
    latestDataRef.current = data;
  }, [data]);

  const fetchDashboardData = useCallback(async (signal) => {
    try {
      setFetchError(null);

      // 2026 Strategy: Fetching all core data points in parallel
      const [userRes, btcRes, plansRes, txRes] = await Promise.all([
        getUserBalance({ signal }),
        getBtcPrice({ signal }),
        getInvestmentPlans({ signal }),
        getTransactions({ signal }),
      ]);

      const btcPrice = Number(btcRes?.price ?? latestDataRef.current.btcPrice);

      setData((prev) => ({
        ...prev,
        // Optional Chaining & Nullish Coalescing prevent app-wide crashes
        balance: userRes?.balance ?? prev.balance,
        plan: userRes?.plan ?? prev.plan,
        dailyRate: userRes?.dailyRate ?? prev.dailyRate,
        btcPrice,
        plans: Array.isArray(plansRes) ? plansRes : prev.plans,
        transactions: Array.isArray(txRes) ? txRes : (txRes?.transactions || prev.transactions),
        btcHistory: [...prev.btcHistory, btcPrice].slice(-60),
      }));
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('Dashboard fetch failed:', err);
      const msg = err.response?.data?.message || 'Failed to sync with secure servers';
      setFetchError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    
    // Initial sync
    fetchDashboardData(controller.signal);

    // Dynamic background polling (30s)
    const refreshInterval = setInterval(() => {
      fetchDashboardData(controller.signal);
    }, 30000);

    return () => {
      controller.abort();
      clearInterval(refreshInterval);
    };
  }, [fetchDashboardData]);

  const handleRetry = () => {
    setLoading(true);
    fetchDashboardData();
  };

  if (loading && data.balance === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin h-16 w-16 border-t-4 border-indigo-500 rounded-full" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-2 w-2 bg-indigo-500 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-indigo-500/30">
      <DashboardHeader
        user={user}
        balance={data.balance ?? 0}
        plan={data.plan || 'Basic'}
        logout={logout}
      />

      {fetchError && (
        <div className="max-w-7xl mx-auto px-4 pt-5">
          <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-6 py-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-red-500" />
              <span className="text-sm font-medium">{fetchError}</span>
            </div>
            <button
              onClick={handleRetry}
              className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-all active:scale-95 text-xs uppercase tracking-widest"
            >
              Retry Sync
            </button>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-10">
        {/* Market Analysis Section */}
        {data.btcHistory.length < 2 ? (
          <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-12 text-center text-slate-500">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-10 w-10 bg-slate-800 rounded-full mb-4" />
              <p>Analyzing market trends...</p>
            </div>
          </div>
        ) : (
          <DashboardCharts
            btcHistory={data.btcHistory}
            btcPrice={data.btcPrice}
            plans={data.plans}
          />
        )}

        {/* Transaction History Section */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-[2rem] p-1 overflow-hidden">
          <RecentTransactions
            transactions={data.transactions}
            isLoading={loading}
          />
        </div>
      </main>
    </div>
  );
}

