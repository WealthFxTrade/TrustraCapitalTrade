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

  const latestDataRef = useRef(data);
  useEffect(() => {
    latestDataRef.current = data;
  }, [data]);

  const fetchDashboardData = useCallback(async (signal) => {
    try {
      setFetchError(null);

      const [userRes, btcRes, plansRes, txRes] = await Promise.all([
        getUserBalance({ signal }),
        getBtcPrice({ signal }),
        getInvestmentPlans({ signal }),
        getTransactions({ signal }),
      ]);

      const btcPrice = Number(btcRes?.price ?? latestDataRef.current.btcPrice);

      setData((prev) => ({
        ...prev,
        balance: userRes?.balance ?? prev.balance,
        plan: userRes?.plan ?? prev.plan,
        dailyRate: userRes?.dailyRate ?? prev.dailyRate,
        btcPrice,
        plans: plansRes ?? prev.plans,
        transactions: txRes ?? prev.transactions,
        btcHistory: [...prev.btcHistory, btcPrice].slice(-60),
      }));
    } catch (err) {
      if (err.name === 'AbortError') return;

      console.error('Dashboard fetch failed:', err);
      const msg = err.message || 'Failed to load dashboard data';
      setFetchError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    // Initial load
    fetchDashboardData(controller.signal);

    // Background refresh every 30s
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
    const controller = new AbortController();
    fetchDashboardData(controller.signal);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin h-14 w-14 border-t-4 border-indigo-500 rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <DashboardHeader
        user={user}
        balance={data.balance ?? 0}
        plan={data.plan || 'Basic'}
        logout={logout}
      />

      {/* Error banner with retry */}
      {fetchError && (
        <div className="max-w-7xl mx-auto px-4 pt-5">
          <div className="bg-red-900/40 border border-red-700 text-red-100 px-6 py-4 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 flex-shrink-0" />
              <span>{fetchError}</span>
            </div>
            <button
              onClick={handleRetry}
              className="px-5 py-2 bg-red-700 hover:bg-red-600 rounded-lg font-medium transition"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-10">
        {/* Charts fallback */}
        {data.btcHistory.length < 2 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
            <p>No price history available yet</p>
          </div>
        ) : (
          <DashboardCharts
            btcHistory={data.btcHistory}
            btcPrice={data.btcPrice}
            plans={data.plans}
          />
        )}

        {/* Transactions section */}
        <RecentTransactions
          transactions={data.transactions}
          isLoading={loading}
        />
      </main>
    </div>
  );
}
