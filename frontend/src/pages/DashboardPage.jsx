import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../components/DashboardHeader';
import DashboardCharts from '../components/DashboardCharts';
import RecentTransactions from '../components/RecentTransactions';
import { fetchBTCPrice } from '../api/market';
import { fetchPlans } from '../api/plan';
import api from '../api/apiService';

export default function DashboardPage({ token, user, logout }) {
  const navigate = useNavigate();

  // ---------- State ----------
  const [balance, setBalance] = useState(null);
  const [plan, setPlan] = useState(null);
  const [dailyRate, setDailyRate] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [btcPrice, setBtcPrice] = useState(77494);
  const [btcHistory, setBtcHistory] = useState([]);
  const [portfolioHistory, setPortfolioHistory] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ---------- Fetch Dashboard Data ----------
  const fetchDashboardData = useCallback(async (signal) => {
    try {
      if (!token) return;

      // Fetch user, transactions, BTC price, plans in parallel
      const [userRes, txRes, btcRes, plansRes] = await Promise.all([
        api.get('/user/me', { signal }),
        api.get('/user/transactions', { signal }),
        fetchBTCPrice(),
        fetchPlans()
      ]);

      // ---------- User Info ----------
      if (userRes.data) {
        setBalance(userRes.data.user.balance);
        setPlan(userRes.data.user.plan);
        setDailyRate(userRes.data.dailyRate);
      }

      // ---------- Transactions ----------
      if (txRes.data) {
        setTransactions(txRes.data.transactions || []);
      }

      // ---------- BTC Price ----------
      if (btcRes !== null) {
        setBtcPrice(btcRes);
        setBtcHistory(prev => [...prev, btcRes].slice(-10));
      }

      // ---------- Plans & Portfolio ----------
      if (plansRes.success) {
        setPlans(plansRes.data);
        const simulatedTotal = plansRes.data.reduce((acc, p) => acc + (p.min * 1.5), 0);
        const flux = simulatedTotal * (btcRes / 77000);
        setPortfolioHistory(prev => [...prev, flux].slice(-10));
      }

      setError(null);
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Dashboard Sync Error:', err);
        setError('Failed to sync dashboard data');
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  // ---------- Lifecycle ----------
  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    const controller = new AbortController();
    fetchDashboardData(controller.signal);
    const interval = setInterval(() => fetchDashboardData(controller.signal), 30000);

    return () => {
      clearInterval(interval);
      controller.abort();
    };
  }, [token, navigate, fetchDashboardData]);

  // ---------- Logout ----------
  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  // ---------- Loading ----------
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <DashboardHeader
        user={user}
        balance={balance}
        plan={plan}
        dailyRate={dailyRate}
        logout={handleLogout}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg">
            {error}
          </div>
        )}

        <DashboardCharts
          btcHistory={btcHistory}
          portfolioHistory={portfolioHistory}
          btcPrice={btcPrice}
          plans={plans}
        />

        <RecentTransactions transactions={transactions} />
      </main>
    </div>
  );
}
