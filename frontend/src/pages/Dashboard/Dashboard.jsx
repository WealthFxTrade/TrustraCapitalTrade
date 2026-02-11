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
  ShieldCheck
} from 'lucide-react';

import api from '../../api/apiService';

export default function Dashboard() {
  const navigate = useNavigate();
  
  // State Management
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
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  // Fetch Data - FIXED: Functional updates to prevent re-render loops
  const fetchDashboardData = useCallback(async () => {
    try {
      setError(null);
      const [statsRes, txRes] = await Promise.all([
        api.get('/user/dashboard'),
        api.get('/transactions/my'),
      ]);

      if (statsRes.data?.success) {
        setStats(prev => ({ ...prev, ...statsRes.data.stats }));
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
    const interval = setInterval(fetchDashboardData, 60000); // 1 min sync
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05070a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-12 w-12 text-blue-500 animate-spin" />
          <p className="text-gray-400 text-[10px] uppercase tracking-[0.3em] font-black">
            Securing Node...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#05070a] text-white font-sans selection:bg-blue-500/30 pb-20 lg:pb-0">
      
      {/* SIDEBAR (DESKTOP) */}
      <aside className="w-64 bg-[#0a0c10] border-r border-white/5 hidden lg:flex flex-col sticky top-0 h-screen overflow-y-auto">
        <div className="p-8 border-b border-white/5 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-blue-500" />
          <span className="font-black text-xl tracking-tighter italic uppercase">Trustra</span>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          <Link to="/dashboard" className="flex items-center gap-3 p-3 bg-blue-600/10 text-blue-500 rounded-xl font-bold uppercase text-[10px] tracking-widest">
            <LayoutDashboard size={18} /> Dashboard
          </Link>

          <Link to="/invest" className="flex items-center gap-3 p-3 hover:bg-white/5 text-gray-400 hover:text-white rounded-xl transition uppercase text-[10px] tracking-widest">
            <PieChart size={18} /> Yield Nodes
          </Link>

          <Link to="/kyc" className="flex items-center gap-3 p-3 hover:bg-white/5 text-gray-400 hover:text-white rounded-xl transition uppercase text-[10px] tracking-widest">
            <ShieldCheck size={18} /> Identity (KYC)
          </Link>

          <div className="pt-8 pb-2 text-[9px] uppercase tracking-[0.2em] text-gray-600 px-3 font-black">Finance</div>

          <Link to="/deposit" className="flex items-center gap-3 p-3 hover:bg-white/5 text-gray-400 hover:text-white rounded-xl transition uppercase text-[10px] tracking-widest">
            <PlusCircle size={18} /> Add Money
          </Link>

          <Link to="/withdraw" className="flex items-center gap-3 p-3 hover:bg-white/5 text-gray-400 hover:text-white rounded-xl transition uppercase text-[10px] tracking-widest">
            <Wallet size={18} /> Withdraw
          </Link>
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* HEADER */}
        <header className="h-20 border-b border-white/5 bg-[#05070a]/80 backdrop-blur-xl flex items-center justify-between px-6 md:px-12 sticky top-0 z-40">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Protocol v8.4.1 Active
            </div>
          </div>
          <button onClick={handleLogout} className="h-10 w-10 flex items-center justify-center bg-white/5 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition border border-white/5">
            <LogOut size={18} />
          </button>
        </header>

        <main className="p-6 md:p-12 space-y-12 max-w-7xl w-full mx-auto">
          {error && (
            <div className="bg-red-900/20 border border-red-500/20 rounded-3xl p-6 text-center text-red-400 text-xs font-bold uppercase tracking-widest">
              {error} • <button onClick={fetchDashboardData} className="underline">Retry Sync</button>
            </div>
          )}

          {/* ASSET OVERVIEW CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0a0c10] border border-white/5 p-8 rounded-[2.5rem] space-y-4 shadow-2xl">
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Main Balance</p>
              <h2 className="text-4xl font-black italic tracking-tighter">€{stats.mainBalance.toLocaleString()}</h2>
            </div>
            <div className="bg-[#0a0c10] border border-white/5 p-8 rounded-[2.5rem] space-y-4 shadow-2xl">
              <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">Total Yield</p>
              <h2 className="text-4xl font-black italic tracking-tighter text-emerald-400">€{stats.totalProfit.toLocaleString()}</h2>
            </div>
            <div className="bg-[#0a0c10] border border-white/5 p-8 rounded-[2.5rem] space-y-4 shadow-2xl">
              <p className="text-blue-500 text-[10px] font-black uppercase tracking-widest">Deployment</p>
              <h2 className="text-xl font-black italic uppercase tracking-tighter truncate">{stats.activePlan}</h2>
            </div>
          </div>

          {/* ACTIVITY TRACKER */}
          <div className="space-y-6">
            <h3 className="text-xl font-black uppercase italic tracking-tight flex items-center gap-2">
              <History className="text-blue-500" size={20} /> Recent Activity
            </h3>
            <div className="bg-[#0a0c10] border border-white/5 rounded-[2.5rem] overflow-hidden">
              {transactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-white/5">
                      <tr className="text-[10px] uppercase text-gray-500 font-black tracking-widest">
                        <th className="p-6">Manifest</th>
                        <th className="p-6">Capital</th>
                        <th className="p-6 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {transactions.map((tx, idx) => (
                        <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition">
                          <td className="p-6 font-bold uppercase italic text-xs">{tx.type}</td>
                          <td className="p-6 font-mono text-gray-300">€{tx.amount.toLocaleString()}</td>
                          <td className="p-6 text-right">
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                              tx.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-400'
                            }`}>
                              {tx.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-20 text-center text-gray-600 uppercase text-[10px] font-black tracking-[0.5em]">
                  No Protocol Activity Detected
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0a0c10]/95 backdrop-blur-2xl border-t border-white/5 px-6 py-5 flex justify-between items-center z-50">
        <Link to="/dashboard" className="flex flex-col items-center gap-1 text-blue-500">
          <LayoutDashboard size={20} />
          <span className="text-[8px] font-black uppercase tracking-widest">Home</span>
        </Link>
        <Link to="/invest" className="flex flex-col items-center gap-1 text-gray-500">
          <PieChart size={20} />
          <span className="text-[8px] font-black uppercase tracking-widest">Nodes</span>
        </Link>
        <Link to="/deposit" className="flex flex-col items-center gap-1 text-gray-500">
          <PlusCircle size={20} />
          <span className="text-[8px] font-black uppercase tracking-widest">Fund</span>
        </Link>
        <Link to="/profile" className="flex flex-col items-center gap-1 text-gray-500">
          <Wallet size={20} />
          <span className="text-[8px] font-black uppercase tracking-widest">Vault</span>
        </Link>
      </div>

    </div>
  );
}

