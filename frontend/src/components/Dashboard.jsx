import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Chart from 'react-apexcharts';
import { LogOut, DollarSign, TrendingUp, RefreshCw, CreditCard, ArrowRight } from 'lucide-react';

// Use the unified API engine
import api from '../api/apiService'; 
import { fetchBTCPrice } from '../api/market';
import { fetchPlans } from '../api/plan';

export default function Dashboard({ user, logout }) {
  const navigate = useNavigate();
  
  const [balance, setBalance] = useState(0);
  const [plan, setPlan] = useState(null);
  const [dailyRate, setDailyRate] = useState(0);
  const [transactions, setTransactions] = useState([]);
  
  const [btcPrice, setBtcPrice] = useState(77494);
  const [plans, setPlans] = useState([]);
  const [btcHistory, setBtcHistory] = useState([]);
  const [portfolioHistory, setPortfolioHistory] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      /**
       * 1. API CALLS VIA UNIFIED ENGINE
       * No more manual fetch or ${BACKEND_URL}. 
       * api.get automatically adds the /api prefix and Bearer token.
       */
      const [userRes, txRes, btcRes, plansRes] = await Promise.all([
        api.get('/auth/me'),
        api.get('/transactions/my'),
        fetchBTCPrice(),
        fetchPlans()
      ]);

      // Handle User Data
      const userData = userRes.data.user;
      setBalance(userData.balance);
      setPlan(userData.plan);
      setDailyRate(userRes.data.dailyRate || 0);

      // Handle Transactions
      setTransactions(txRes.data.transactions || []);

      // Handle Market Stats
      if (btcRes.success) {
        const price = Number(btcRes.price);
        setBtcPrice(price);
        setBtcHistory(prev => [...prev, price].slice(-10));
      }

      if (plansRes.success) {
        setPlans(plansRes.data);
        const flux = (userData.balance || 1000) * (Number(btcRes.price) / 77000);
        setPortfolioHistory(prev => [...prev, flux].slice(-10));
      }

      setError(null);
    } catch (err) {
      console.error('Dashboard Sync Error:', err);
      // If interceptor doesn't catch it, show local error
      setError(err.message || 'Connecting to Trustra Nodes...');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 60000); 
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  if (loading && !balance) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <RefreshCw className="h-10 w-10 text-indigo-500 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* HEADER */}
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <span className="flex items-center space-x-2">
            <TrendingUp className="h-8 w-8 text-indigo-500" />
            <span className="text-xl font-bold tracking-tighter">TrustraCapital</span>
          </span>
          <div className="flex items-center gap-6">
            <span className="hidden md:block text-sm text-gray-400 font-medium">
              {user?.fullName || 'Investor'}
            </span>
            <button onClick={handleLogout} className="text-gray-300 hover:text-red-400 transition flex items-center gap-2 text-sm font-bold">
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* TOP STATS CARD */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-gradient-to-br from-indigo-600/20 to-transparent border border-indigo-500/30 rounded-3xl p-8">
            <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest mb-2">Available Portfolio Balance</p>
            <h2 className="text-5xl font-bold text-white mb-4">
              ${(balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h2>
            <div className="flex gap-4">
              <button onClick={() => navigate('/deposit')} className="bg-indigo-600 hover:bg-indigo-500 px-6 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2">
                <CreditCard className="h-4 w-4" /> Deposit
              </button>
            </div>
          </div>
          
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 flex flex-col justify-center">
            <p className="text-gray-500 text-xs font-bold uppercase mb-2">Active ROI Plan</p>
            <p className="text-2xl font-bold text-white mb-1">{plan || 'No Active Plan'}</p>
            {dailyRate > 0 && <span className="text-green-400 text-sm font-bold">Yielding {(dailyRate * 100).toFixed(2)}% Daily</span>}
          </div>
        </div>

        {/* ANALYTICS SECTION */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-3xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg">Market Performance</h3>
              <div className="flex items-center gap-2 bg-gray-950 px-3 py-1 rounded-full border border-gray-800">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Live ${btcPrice.toLocaleString()}</span>
              </div>
            </div>
            <Chart 
              options={{
                chart: { id: 'market-chart', toolbar: { show: false }, background: 'transparent', foreColor: '#64748b' },
                colors: ['#6366f1', '#10b981'],
                stroke: { curve: 'smooth', width: 2 },
                grid: { borderColor: '#1e293b', strokeDashArray: 4 },
                xaxis: { labels: { show: false }, axisBorder: { show: false } },
                tooltip: { theme: 'dark' }
              }} 
              series={[{ name: 'Market', data: btcHistory }, { name: 'Portfolio', data: portfolioHistory }]} 
              type="area" 
              height={300} 
            />
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6">
            <h3 className="font-bold text-lg mb-6 text-center">Plan Allocation</h3>
            <Chart 
              options={{
                labels: plans.map(p => p.name),
                colors: ['#6366f1', '#10b981', '#f59e0b', '#ef4444'],
                legend: { position: 'bottom', labels: { colors: '#94a3b8' } },
                stroke: { show: false },
                dataLabels: { enabled: false }
              }} 
              series={plans.map(p => p.min)} 
              type="donut" 
              height={300} 
            />
          </div>
        </div>
      </main>
    </div>
  );
}

