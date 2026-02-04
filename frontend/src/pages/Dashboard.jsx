import React, { useEffect, useState, useCallback, useRef } from 'react';
import DashboardHeader from '../components/DashboardHeader';
import DashboardCharts from '../components/DashboardCharts';
import RecentTransactions from '../components/RecentTransactions';
import { getUserBalance, getBtcPrice, getInvestmentPlans, getTransactions } from '../api';

export default function DashboardPage({ user, logout }) {
  const [data, setData] = useState({
    balance: 0,
    plan: 'Basic',
    dailyRate: 0,
    btcPrice: 77494,
    btcHistory: [],
    plans: [],
    transactions: []
  });
  const [loading, setLoading] = useState(true);
  const latestDataRef = useRef(data);

  // Keep ref updated
  useEffect(() => { latestDataRef.current = data }, [data]);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async (signal) => {
    try {
      const [userRes, btcRes, plansRes, txRes] = await Promise.all([
        getUserBalance(signal),
        getBtcPrice(signal),
        getInvestmentPlans(signal),
        getTransactions(signal)
      ]);

      const btcPrice = Number(btcRes?.data?.price ?? latestDataRef.current.btcPrice);

      setData(prev => ({
        ...prev,
        balance: userRes?.data?.user?.balance ?? prev.balance,
        plan: userRes?.data?.user?.plan ?? prev.plan,
        dailyRate: userRes?.data?.dailyRate ?? prev.dailyRate,
        btcPrice,
        plans: plansRes?.data ?? prev.plans,
        transactions: txRes?.data?.transactions ?? prev.transactions,
        btcHistory: [...prev.btcHistory, btcPrice].slice(-30)
      }));
    } catch (err) {
      console.error('Dashboard fetch failed:', err);
    } finally { setLoading(false); }
  }, []);

  // Live BTC price simulation
  const simulateBtcPrice = useCallback(() => {
    setData(prev => {
      const change = (Math.random() - 0.5) * 0.004;
      const newPrice = +(prev.btcPrice * (1 + change)).toFixed(2);
      return { ...prev, btcPrice: newPrice, btcHistory: [...prev.btcHistory, newPrice].slice(-30) };
    });
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    fetchDashboardData(controller.signal);

    const priceInterval = setInterval(simulateBtcPrice, 2000);
    const refreshInterval = setInterval(() => fetchDashboardData(controller.signal), 30000);

    return () => {
      controller.abort();
      clearInterval(priceInterval);
      clearInterval(refreshInterval);
    };
  }, [fetchDashboardData, simulateBtcPrice]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin h-10 w-10 border-t-4 border-blue-500 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <DashboardHeader user={user} balance={data.balance} plan={data.plan} logout={logout} />

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-10">
        <DashboardCharts btcHistory={data.btcHistory} btcPrice={data.btcPrice} plans={data.plans} />
        <RecentTransactions transactions={data.transactions} />
      </main>
    </div>
  );
}
