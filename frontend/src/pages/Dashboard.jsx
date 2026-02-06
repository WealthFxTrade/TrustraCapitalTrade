import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  LogOut, RefreshCw, CreditCard, TrendingUp, Wallet, 
  LayoutDashboard, PieChart, History, ArrowRightLeft, 
  Send, PlusCircle, Languages 
} from 'lucide-react';
import api from '../api/apiService';

export default function Dashboard({ user, logout }) {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [plan, setPlan] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [statsRes, txRes] = await Promise.all([
        api.get('/user/dashboard'),
        api.get('/transactions/my')
      ]);

      if (statsRes.data.success) {
        const { stats } = statsRes.data;
        setBalance(stats.mainBalance || 0);
        setTotalProfit(stats.totalProfit || 0);
        setPlan(stats.activePlan);
      }
      setTransactions(txRes.data.transactions || []);
    } catch (err) {
      console.error('Trustra Sync Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 60000); 
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  if (loading && !balance) return (
    <div className="min-h-screen bg-[#0a0d14] flex items-center justify-center">
      <RefreshCw className="h-10 w-10 text-indigo-500 animate-spin" />
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#0a0d14] text-white font-sans">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#0f121d] border-r border-gray-800 hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-gray-800 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-indigo-500" />
          <span className="font-bold text-lg tracking-tight">TrustraCapital</span>
        </div>
        <nav className="flex-1 p-4 space-y-1 text-sm text-gray-400">
          <Link to="/dashboard" className="flex items-center gap-3 p-3 bg-indigo-600/10 text-indigo-400 rounded-lg font-bold uppercase text-[11px] tracking-wider">
            <LayoutDashboard size={18} /> DASHBOARD
          </Link>
          <Link to="/plans" className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg transition uppercase text-[11px] tracking-wider">
            <PieChart size={18} /> ALL SCHEMA
          </Link>
          <Link to="/logs" className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg transition uppercase text-[11px] tracking-wider">
            <History size={18} /> SCHEMA LOGS
          </Link>
          <div className="pt-6 pb-2 text-[10px] uppercase tracking-widest text-gray-600 px-3 font-bold">Payments</div>
          <Link to="/deposit" className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg transition uppercase text-[11px] tracking-wider">
            <PlusCircle size={18} /> ADD MONEY
          </Link>
          <Link to="/wallet-exchange" className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg transition uppercase text-[11px] tracking-wider">
            <ArrowRightLeft size={18} /> WALLET EXCHANGE
          </Link>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-gray-800 bg-[#0f121d]/80 flex items-center justify-between px-8">
          <div className="flex items-center gap-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
             <span className="bg-indigo-600 text-white h-5 w-5 flex items-center justify-center rounded-full text-[10px]">5</span>
             <div className="flex items-center gap-1"><Languages size={14} /> English</div>
          </div>
          <button onClick={logout} className="text-gray-400 hover:text-red-400"><LogOut size={18} /></button>
        </header>

        <main className="p-8 space-y-8 max-w-6xl w-full mx-auto">
          <h1 className="text-2xl font-bold">Account Balance</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* MAIN WALLET */}
            <div className="bg-[#161b29] border border-gray-800 rounded-2xl p-6 flex items-center justify-between shadow-lg">
              <div>
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Main Wallet</p>
                <h3 className="text-3xl font-bold text-white">€{Number(balance).toLocaleString()}</h3>
              </div>
              <div className="h-12 w-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 border border-indigo-500/20">
                <Wallet size={22} />
              </div>
            </div>

            {/* PROFIT WALLET */}
            <div className="bg-[#161b29] border border-gray-800 rounded-2xl p-6 flex items-center justify-between shadow-lg">
              <div>
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Profit Wallet</p>
                <h3 className="text-3xl font-bold text-green-400">€{Number(totalProfit).toLocaleString()}</h3>
              </div>
              <div className="h-12 w-12 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500 border border-green-500/20">
                <TrendingUp size={22} />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={() => navigate('/deposit')} className="flex-1 bg-indigo-600 hover:bg-indigo-500 py-4 rounded-xl font-bold text-xs tracking-widest uppercase transition">Deposit</button>
            <button onClick={() => navigate('/plans')} className="flex-1 bg-[#161b29] border border-gray-800 hover:bg-gray-800 py-4 rounded-xl font-bold text-xs tracking-widest uppercase transition">Invest Now</button>
          </div>

          {/* TABLE */}
          <div className="bg-[#161b29] border border-gray-800 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-gray-800 font-bold text-sm tracking-widest uppercase text-gray-400">Recent Activity</div>
            <table className="w-full text-left text-sm">
              <thead className="bg-[#0f121d] text-[10px] text-gray-500 uppercase">
                <tr>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {transactions.slice(0, 5).map((tx, i) => (
                  <tr key={i} className="hover:bg-gray-800/20 transition">
                    <td className="px-6 py-4 capitalize font-medium">{tx.type.replace('_', ' ')}</td>
                    <td className={`px-6 py-4 font-bold ${['deposit', 'roi_profit'].includes(tx.type) ? 'text-green-400' : 'text-red-400'}`}>
                      {['deposit', 'roi_profit'].includes(tx.type) ? '+' : '-'}€{tx.amount}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-[10px] font-bold uppercase px-2 py-1 bg-gray-800 rounded text-gray-400">{tx.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}

