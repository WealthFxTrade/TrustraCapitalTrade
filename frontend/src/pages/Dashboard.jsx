import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../components/DashboardHeader';
import DashboardCharts from '../components/DashboardCharts';
import RecentTransactions from '../components/RecentTransactions';
// Added getTransactions to the imports
import { api, getUserBalance, getBtcPrice, getInvestmentPlans, getTransactions } from '../api';

export default function DashboardPage({ user, logout }) {
  const navigate = useNavigate();
  const [data, setData] = useState({
    balance: 0,
    plan: 'Basic',
    dailyRate: 0,
    transactions: [],
    btcPrice: 0,
    btcHistory: [],
    plans: []
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async (signal) => {
    try {
      // Added getTransactions() to the parallel fetch
      const [userRes, btcRes, plansRes, txRes] = await Promise.all([
        getUserBalance(),
        getBtcPrice(),
        getInvestmentPlans(),
        getTransactions() 
      ]);

      const btcPrice = Number(btcRes.data.price);

      setData(prev => ({
        ...prev,
        balance: userRes.data.user.balance,
        plan: userRes.data.user.plan,
        dailyRate: userRes.data.dailyRate,
        btcPrice: btcPrice,
        plans: plansRes.data || [],
        // Correctly mapping transactions from the API response
        transactions: txRes.data.transactions || [],
        btcHistory: [...prev.btcHistory, btcPrice].slice(-10)
      }));
    } catch (err) {
      // Axios uses 'CanceledError', native fetch uses 'AbortError'
      if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
        console.error('Dashboard sync error:', err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchDashboardData(controller.signal);
    
    // Auto-refresh every 30 seconds to keep the BTC price live
    const interval = setInterval(() => fetchDashboardData(controller.signal), 30000);

    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <DashboardHeader
        user={user}
        balance={data.balance}
        plan={data.plan}
        logout={logout}
      />
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-10">
        <DashboardCharts
          btcHistory={data.btcHistory}
          btcPrice={data.btcPrice}
          plans={data.plans}
        />
        {/* Now correctly passing the fetched transactions */}
        <RecentTransactions transactions={data.transactions} />
      </main>
    </div>
  );
}

