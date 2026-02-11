import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  LogOut,
  RefreshCw,
  TrendingUp,
  Wallet,
  LayoutDashboard,
  PieChart,
  ShieldCheck,
  PlusCircle,
  Zap
} from 'lucide-react';
import api from '../../api/apiService';

export default function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    mainBalance: 0,
    totalProfit: 0,
    activePlan: 'No Active Plan',
  });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Logout Handler
  const handleLogout = () => {
    localStorage.removeItem('userInfo'); // Adjust based on your login storage key
    navigate('/login');
  };

  // Fetch Dashboard Data
  const fetchDashboardData = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      // Call your backend dashboard API
      const userRes = await api.get('/user/dashboard');

      if (userRes.data?.stats) {
        const s = userRes.data.stats;
        setStats({
          mainBalance: s.mainBalance,
          totalProfit: s.totalProfit,
          activePlan: s.activePlan,
        });
      }

      setTransactions(userRes.data.transactions || []);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      const message = err.response?.data?.message || 'Failed to load dashboard data';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh every 60s
  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05070a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-12 w-12 text-blue-500 animate-spin" />
          <p className="text-gray-400 text-[10px] uppercase tracking-[0.3em] font-black">
            Syncing Node...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#05070a] text-white font-sans selection:bg-blue-500/30">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#0a0c10] border-r border-white/5 hidden lg:flex flex-col sticky top-0 h-screen">
        <div
          className="p-8 border-b border-white/5 flex items-center gap-2 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <TrendingUp className="h-6 w-6 text-blue-500" />
          <span className="font-black text-xl tracking-tighter italic uppercase">Trustra</span>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 p-3 bg-blue-600/10 text-blue-500 rounded-xl font-bold uppercase text-[10px] tracking-widest"
          >
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <Link
            to="/"
            className="flex items-center gap-3 p-3 hover:bg-white/5 text-gray-400 hover:text-white rounded-xl transition uppercase text-[10px] tracking-widest"
          >
            <Zap size={18} /> Home Page
          </Link>
          <Link
            to="/invest"
            className="flex items-center gap-3 p-3 hover:bg-white/5 text-gray-400 hover:text-white rounded-xl transition uppercase text-[10px] tracking-widest"
          >
            <PieChart size={18} /> Yield Nodes
          </Link>
          <Link
            to="/kyc"
            className="flex items-center gap-3 p-3 hover:bg-white/5 text-gray-400 hover:text-white rounded-xl transition uppercase text-[10px] tracking-widest"
          >
            <ShieldCheck size={18} /> Identity (KYC)
          </Link>

          <div className="pt-8 pb-2 text-[9px] uppercase tracking-[0.2em] text-gray-600 px-3 font-black">
            Finance
          </div>
          <Link
            to="/deposit"
            className="flex items-center gap-3 p-3 hover:bg-white/5 text-gray-400 hover:text-white rounded-xl transition uppercase text-[10px] tracking-widest"
          >
            <PlusCircle size={18} /> Add Money
          </Link>
          <Link
            to="/withdraw"
            className="flex items-center gap-3 p-3 hover:bg-white/5 text-gray-400 hover:text-white rounded-xl transition uppercase text-[10px] tracking-widest"
          >
            <Wallet size={18} /> Withdraw
          </Link>
        </nav>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col">
        <header className="h-20 border-b border-white/5 bg-[#05070a]/80 backdrop-blur-xl flex items-center justify-between px-12 sticky top-0 z-40">
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Protocol v8.4.1 Active
          </div>
          <button
            onClick={handleLogout}
            className="h-10 w-10 flex items-center justify-center bg-white/5 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition border border-white/5"
          >
            <LogOut size={18} />
          </button>
        </header>

        <main className="p-12 space-y-12 max-w-7xl w-full mx-auto">
          {/* STATS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 shadow-2xl">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">
                Available Balance
              </p>
              <p className="text-4xl font-black text-white italic">
                €{stats.mainBalance.toLocaleString()}
              </p>
            </div>
            <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 shadow-2xl">
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-2">
                Active Plan
              </p>
              <p className="text-2xl font-black text-white uppercase italic">{stats.activePlan}</p>
            </div>
            <div className="p-8 rounded-3xl bg-blue-600 text-white shadow-xl shadow-blue-600/20">
              <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] mb-2">
                Total Profit
              </p>
              <p className="text-4xl font-black italic">€{stats.totalProfit.toLocaleString()}</p>
            </div>
          </div>

          {/* TRANSACTIONS LIST */}
          <div className="mt-12">
            <h2 className="text-lg font-bold text-gray-400 uppercase tracking-widest mb-4">
              Recent Transactions
            </h2>
            <div className="space-y-2">
              {transactions.length === 0 ? (
                <p className="text-gray-500 text-sm">No recent transactions</p>
              ) : (
                transactions.map((tx, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-4 bg-white/[0.02] border border-white/5 rounded-xl"
                  >
                    <span className="capitalize">{tx.type.replace('_', ' ')}</span>
                    <span>€{Number(tx.amount).toLocaleString()}</span>
                    <span className="text-gray-400 text-xs">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
