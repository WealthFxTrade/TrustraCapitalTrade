// src/pages/DashboardPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../components/DashboardHeader';
import DashboardCharts from '../components/DashboardCharts';
import RecentTransactions from '../components/RecentTransactions';
import { fetchBTCPrice } from '../api/market';
import { fetchPlans } from '../api/plan';

const BACKEND_URL = 'https://trustracapitaltrade-backend.onrender.com';

export default function DashboardPage({ token, user, logout }) {
  const navigate = useNavigate();

  // State Management
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

  // Wrapped fetch logic in useCallback to safely use as a dependency
  const fetchDashboardData = useCallback(async (signal) => {
    try {
      if (!token) return;

      // Parallel fetching for performance
      const [userRes, txRes, btcRes, plansRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/user/me`, { headers: { Authorization: `Bearer ${token}` }, signal }),
        fetch(`${BACKEND_URL}/api/user/transactions`, { headers: { Authorization: `Bearer ${token}` }, signal }),
        fetchBTCPrice(),
        fetchPlans()
      ]);

      if (userRes.ok) {
        const userData = await userRes.json();
        setBalance(userData.user.balance);
        setPlan(userData.user.plan);
        setDailyRate(userData.dailyRate);
      }

      if (txRes.ok) {
        const txData = await txRes.json();
        setTransactions(txData.transactions || []);
      }

      if (btcRes.success) {
        const price = Number(btcRes.price);
        setBtcPrice(price);
        setBtcHistory(prev => [...prev, price].slice(-10));
      }

      if (plansRes.success) {
        setPlans(plansRes.data);
        // Portfolio flux simulation logic
        const simulatedTotal = plansRes.data.reduce((acc, p) => acc + (p.min * 1.5), 0);
        const flux = simulatedTotal * (Number(btcRes.price) / 77000);
        setPortfolioHistory(prev => [...prev, flux].slice(-10));
      }

      setError(null);
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Sync Error:', err);
        setError('Failed to sync dashboard data');
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    const controller = new AbortController();
    fetchDashboardData(controller.signal);

    const interval = setInterval(() => fetchDashboardData(controller.signal), 30000);

    // Cleanup: Clear interval and abort pending requests on unmount
    return () => {
      clearInterval(interval);
      controller.abort();
    };
  }, [token, navigate, fetchDashboardData]);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <DashboardHeader 
        user={user} 
        balance={balance} 
        plan={plan} 
        dailyRate={dailyRate} 
        logout={handleLogout} 
      />
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

