import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Chart from 'react-apexcharts';
import { LogOut, RefreshCw, CreditCard, TrendingUp, ArrowUpRight, Wallet } from 'lucide-react';
import api from '../api/apiService';
import { fetchBTCPrice } from '../api/market';
import { fetchPlans } from '../api/plan';

export default function Dashboard({ user, logout }) {
  const navigate = useNavigate();

  const [balance, setBalance] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0); // Added for 2026 Stats
  const [plan, setPlan] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [btcPrice, setBtcPrice] = useState(77494);
  const [plans, setPlans] = useState([]);
  const [btcHistory, setBtcHistory] = useState([]);
  const [portfolioHistory, setPortfolioHistory] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      // 1. CALL THE STATS ENDPOINT (Matches your new backend logic)
      const [statsRes, txRes, btcRes, plansRes] = await Promise.all([
        api.get('/user/dashboard'),
        api.get('/transactions/my'),
        fetchBTCPrice(),
        fetchPlans()
      ]);

      // 2. MAP THE 2026 STATS OBJECT
      if (statsRes.data.success) {
        const { stats } = statsRes.data;
        setBalance(stats.mainBalance); // Fixes the $0.00 issue
        setTotalProfit(stats.totalProfit);
        setPlan(stats.activePlan);
      }

      // 3. HANDLE TRANSACTIONS
      setTransactions(txRes.data.transactions || []);

      // 4. HANDLE MARKET DATA
      if (btcRes.success) {
        const price = Number(btcRes.price);
        setBtcPrice(price);
        setBtcHistory(prev => [...prev, price].slice(-10));
      }

      if (plansRes.success) {
        setPlans(plansRes.plans || []);
        // Portfolio flux calculation based on actual balance
        const flux = (balance || 1000) * (Number(btcRes.price) / 77000);
        setPortfolioHistory(prev => [...prev, flux].slice(-10));
      }

      setError(null);
    } catch (err) {
      console.error('Dashboard Sync Error:', err);
      setError(err.message || 'Connecting to Trustra Nodes...');
    } finally {
      setLoading(false);
    }
  }, [balance]);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 60000); // 60s Refresh
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
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">
          <span className="flex items-center space-x-2">
            <TrendingUp className="h-8 w-8 text-indigo-500" />
            <span className="text-xl font-bold tracking-tighter">TrustraCapital</span>
          </span>
          <div className="flex items-center gap-6">
            <span className="hidden md:block text-sm text-gray-400">
              {user?.fullName || 'Investor'}
            </span>
            <button onClick={handleLogout} className="text-gray-300 hover:text-red-400 transition flex items-center gap-2 text-sm font-bold">
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* TOP STATS CARDS */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-gradient-to-br from-indigo-600/20 to-transparent border border-indigo-500/30 rounded-3xl p-8">
            <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest mb-2">Available Balance</p>
            <h2 className="text-5xl font-bold text-white mb-4">
              ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h2>
            <div className="flex gap-4">
              <button onClick={() => navigate('/deposit')} className="bg-indigo-600 hover:bg-indigo-500 px-6 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2">
                <CreditCard className="h-4 w-4" /> Deposit
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6">
              <p className="text-gray-500 text-xs font-bold uppercase mb-2">Active Plan</p>
              <p className="text-2xl font-bold text-white">{plan || 'None'}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6">
              <p className="text-gray-500 text-xs font-bold uppercase mb-2">Total ROI Profit</p>
              <p className="text-2xl font-bold text-green-400">+${totalProfit.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* LEDGER TABLE */}
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
            <Wallet className="h-5 w-5 text-indigo-500" /> Recent Activity
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-xs text-gray-500 uppercase border-b border-gray-800">
                <tr>
                  <th className="pb-4">Type</th>
                  <th className="pb-4">Amount</th>
                  <th className="pb-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {transactions.map((tx, idx) => (
                  <tr key={idx} className="group">
                    <td className="py-4 font-medium capitalize">{tx.type}</td>
                    <td className={`py-4 font-bold ${tx.type === 'deposit' || tx.type === 'roi_profit' ? 'text-green-400' : 'text-red-400'}`}>
                      {tx.type === 'deposit' || tx.type === 'roi_profit' ? '+' : '-'}${Number(tx.amount).toLocaleString()}
                    </td>
                    <td className="py-4 text-xs">
                      <span className={`px-3 py-1 rounded-full ${tx.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

