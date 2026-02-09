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
  History,
  ArrowRightLeft,
  PlusCircle,
  Languages,
  Zap,
} from 'lucide-react';
import api from '../api/apiService'; // assuming this is your centralized axios instance

export default function Dashboard({ logout }) {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    mainBalance: 0,
    totalProfit: 0,
    activePlan: 'No Active Plan',
  });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setError(null);
      const [statsRes, txRes] = await Promise.all([
        api.get('/user/dashboard'),
        api.get('/transactions/my'),
      ]);

      if (statsRes.data?.success) {
        setStats(statsRes.data.stats || stats);
      }

      setTransactions(txRes.data?.transactions || []);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      const message = err.response?.data?.message || 'Failed to load dashboard data';
      toast.error(message);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();

    const interval = setInterval(fetchDashboardData, 60000); // 1 min refresh
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  if (loading && stats.mainBalance === 0) {
    return (
      <div className="min-h-screen bg-[#05070a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-12 w-12 text-blue-500 animate-spin" />
          <p className="text-gray-400 text-sm uppercase tracking-widest font-bold">
            Loading Portfolio...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#05070a] text-white font-sans selection:bg-blue-500/30">
      {/* SIDEBAR – hidden on mobile, can be made drawer later */}
      <aside className="w-64 bg-[#0a0c10] border-r border-white/5 hidden lg:flex flex-col sticky top-0 h-screen overflow-y-auto">
        <div className="p-8 border-b border-white/5 flex items-center gap-2">
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
            to="/plans"
            className="flex items-center gap-3 p-3 hover:bg-white/5 text-gray-400 hover:text-white rounded-xl transition uppercase text-[10px] tracking-widest"
          >
            <PieChart size={18} /> Investment Plans
          </Link>

          <Link
            to="/logs"
            className="flex items-center gap-3 p-3 hover:bg-white/5 text-gray-400 hover:text-white rounded-xl transition uppercase text-[10px] tracking-widest"
          >
            <History size={18} /> Schema Logs
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
            to="/exchange"
            className="flex items-center gap-3 p-3 hover:bg-white/5 text-gray-400 hover:text-white rounded-xl transition uppercase text-[10px] tracking-widest"
          >
            <ArrowRightLeft size={18} /> Wallet Exchange
          </Link>
        </nav>
      </aside>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* HEADER */}
        <header className="h-16 md:h-20 border-b border-white/5 bg-[#05070a]/80 backdrop-blur-xl flex items-center justify-between px-6 md:px-8 sticky top-0 z-40">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Live Server 2026
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-white transition">
              <Languages size={14} className="text-blue-500" />
              English
            </div>
          </div>

          <button
            onClick={logout}
            className="h-10 w-10 flex items-center justify-center bg-white/5 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition text-gray-400 border border-white/5"
            title="Sign Out"
          >
            <LogOut size={18} />
          </button>
        </header>

        {/* CONTENT */}
        <main className="p-6 md:p-8 lg:p-12 space-y-10 max-w-7xl w-full mx-auto">
          {error && (
            <div className="bg-red-900/30 border border-red-500/30 rounded-2xl p-6 text-center text-red-300">
              {error} • <button onClick={fetchDashboardData} className="underline hover:text-white">Retry</button>
            </div>
          )}

          {/* ACCOUNT OVERVIEW */}
          <header>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">Account Overview</h1>
            <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest text-[10px] font-bold">
              Rio Series Portfolio
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <WalletCard balance={stats.mainBalance} />
            <ProfitCard profit={stats.totalProfit} />
            <ActivePlanCard plan={stats.activePlan} navigate={navigate} />
          </div>

          {/* QUICK ACTIONS */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/deposit')}
              className="flex-1 bg-blue-600 hover:bg-blue-500 py-5 rounded-2xl font-black text-[11px] tracking-[0.2em] uppercase transition shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 active:scale-95"
            >
              <PlusCircle size={16} /> Deposit Funds
            </button>
            <button
              onClick={() => navigate('/plans')}
              className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 py-5 rounded-2xl font-black text-[11px] tracking-[0.2em] uppercase transition flex items-center justify-center gap-2 active:scale-95"
            >
              <Zap size={16} className="text-yellow-500" /> Start Investing
            </button>
          </div>

          {/* TRANSACTIONS */}
          <TransactionTable transactions={transactions} />
        </main>
      </div>
    </div>
  );
}

/* ── CHILD COMPONENTS (unchanged except minor polish) ── */
const WalletCard = ({ balance }) => (
  <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md relative overflow-hidden group hover:border-blue-500/30 transition-all">
    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-300">
      <Wallet size={80} />
    </div>
    <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Available Balance</p>
    <h3 className="text-4xl font-mono font-black text-white">
      €{Number(balance).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </h3>
    <div className="mt-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-tighter">
      Main Wallet <ArrowRightLeft size={10} />
    </div>
  </div>
);

const ProfitCard = ({ profit }) => (
  <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md relative overflow-hidden group hover:border-green-500/30 transition-all">
    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-300">
      <TrendingUp size={80} />
    </div>
    <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Total ROI Profit</p>
    <h3 className="text-4xl font-mono font-black text-green-400">
      €{Number(profit).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </h3>
    <div className="mt-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-[10px] font-bold uppercase tracking-tighter">
      Profit Wallet <TrendingUp size={10} />
    </div>
  </div>
);

const ActivePlanCard = ({ plan, navigate }) => (
  <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md lg:col-span-1 md:col-span-2 hover:border-yellow-500/30 transition-all">
    <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Current Schema</p>
    <h3 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tighter">
      {plan || 'Inactive'}
    </h3>
    <button
      onClick={() => navigate('/plans')}
      className="mt-6 w-full py-3 bg-white/5 hover:bg-white hover:text-black border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition"
    >
      {plan ? 'Upgrade Plan' : 'Buy Schema'}
    </button>
  </div>
);

const TransactionTable = ({ transactions }) => (
  <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-md">
    <div className="p-6 border-b border-white/10 flex items-center justify-between">
      <h3 className="font-bold text-[11px] tracking-[0.2em] uppercase text-gray-400 flex items-center gap-2">
        <History size={16} className="text-blue-500" /> Recent Activity
      </h3>
      <Link
        to="/logs"
        className="text-[10px] font-bold text-blue-500 hover:text-blue-400 uppercase tracking-widest transition-colors"
      >
        View All
      </Link>
    </div>

    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-white/[0.02] text-[10px] text-gray-500 uppercase tracking-widest">
          <tr>
            <th className="px-6 md:px-8 py-5 font-black">Type</th>
            <th className="px-6 md:px-8 py-5 font-black">Value</th>
            <th className="px-6 md:px-8 py-5 font-black text-right">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {transactions.length === 0 ? (
            <tr>
              <td colSpan={3} className="px-8 py-12 text-center text-gray-500 text-xs font-bold uppercase tracking-widest italic">
                No transactions yet
              </td>
            </tr>
          ) : (
            transactions.slice(0, 5).map((tx, i) => (
              <tr key={i} className="hover:bg-white/[0.03] transition group">
                <td className="px-6 md:px-8 py-6 capitalize font-bold text-sm tracking-tight group-hover:text-blue-400 transition-colors">
                  {tx.type?.replace('_', ' ') || 'Unknown'}
                </td>
                <td
                  className={`px-6 md:px-8 py-6 font-mono font-black ${
                    ['deposit', 'roi_profit'].includes(tx.type) ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {['deposit', 'roi_profit'].includes(tx.type) ? '+' : '-'}€
                  {Number(tx.amount || 0).toLocaleString('de-DE')}
                </td>
                <td className="px-6 md:px-8 py-6 text-right">
                  <span className="text-[9px] font-black uppercase px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-gray-400 group-hover:border-blue-500/30 transition-colors">
                    {tx.status || 'Pending'}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);
